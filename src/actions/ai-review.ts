"use server"

import { prisma } from "@/lib/prisma"
import { getOpenAI } from "@/lib/openai"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { zodResponseFormat } from "openai/helpers/zod"
import { z } from "zod/v4"
import type { Prisma } from "@prisma/client"
import { serializePrisma } from "@/lib/serialize"

// --------------- Zod schemas for structured outputs ---------------

const BusinessTermsSchema = z.object({
  amount: z.nullable(z.string()),
  currency: z.nullable(z.string()),
  startDate: z.nullable(z.string()),
  endDate: z.nullable(z.string()),
  renewalDate: z.nullable(z.string()),
  cancellationNotice: z.nullable(z.string()),
})

const SummaryResponseSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  businessTerms: BusinessTermsSchema,
  plainHebrewExplanation: z.string(),
})

const RiskFindingSchema = z.object({
  title: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  category: z.string(),
  explanation: z.string(),
  suggestedFix: z.string(),
})

const RiskReviewSchema = z.object({
  riskScore: z.int().min(0).max(100),
  summary: z.string(),
  findings: z.array(RiskFindingSchema),
})

const MissingClauseSchema = z.object({
  clause: z.string(),
  importance: z.enum(["low", "medium", "high"]),
  reason: z.string(),
  suggestedText: z.string(),
})

const MissingClausesResponseSchema = z.object({
  missingClauses: z.array(MissingClauseSchema),
})

const ObligationSchema = z.object({
  title: z.string(),
  type: z.enum(["payment", "renewal", "notice", "deliverable", "legal", "other"]),
  dueDate: z.nullable(z.string()),
  owner: z.nullable(z.string()),
  description: z.string(),
  source: z.nullable(z.string()),
})

const ObligationsResponseSchema = z.object({
  obligations: z.array(ObligationSchema),
})

const SuggestionSchema = z.object({
  originalIssue: z.string(),
  suggestedClauseTitle: z.string(),
  suggestedClauseText: z.string(),
  reason: z.string(),
  riskReduction: z.enum(["low", "medium", "high"]),
})

const SuggestionsResponseSchema = z.object({
  suggestions: z.array(SuggestionSchema),
})

// --------------- Types ---------------

export type SummaryResponse = z.infer<typeof SummaryResponseSchema>
export type RiskReview = z.infer<typeof RiskReviewSchema>
export type RiskFinding = z.infer<typeof RiskFindingSchema>
export type MissingClausesResponse = z.infer<typeof MissingClausesResponseSchema>
export type MissingClause = z.infer<typeof MissingClauseSchema>
export type ObligationsResponse = z.infer<typeof ObligationsResponseSchema>
export type Obligation = z.infer<typeof ObligationSchema>
export type SuggestionsResponse = z.infer<typeof SuggestionsResponseSchema>
export type Suggestion = z.infer<typeof SuggestionSchema>

export interface AiReviewRecord {
  id: string
  reviewType: string
  riskScore: number | null
  summary: string | null
  findings: unknown
  missingClauses: unknown
  obligations: unknown
  suggestions: unknown
  createdAt: string
}

// --------------- Prompt constants ---------------

const AI_DISCLAIMER =
  "\n\nהערה חשובה: הבדיקה מבוססת על ניתוח אוטומטי ואינה מהווה ייעוץ משפטי. יש לוודא מול יועץ משפטי."

const SYSTEM_ROLE = `אתה עוזר legal-tech מומחה לניתוח חוזים עסקיים. תפקידך: ניתוח תפעולי של חוזים, זיהוי סיכונים עסקיים, ובדיקת שלמות ההסכם.

כללים:
- ענה תמיד בעברית.
- אל תטען שאתה עורך דין ואל תתן ייעוץ משפטי סופי.
- השתמש בניסוחים כמו: "מומלץ לבדוק", "כדאי להוסיף", "הסעיף עשוי ליצור סיכון", "יש לוודא מול יועץ משפטי".
- בדוק: תנאי תשלום, אחריות מוגבלת, סודיות, סיום וביטול, חידוש, דין חל, היקף עבודה, התחייבויות חד-צדדיות, סמכות חתימה.`

// --------------- Helpers ---------------

async function getContractText(contractId: string, organizationId: string): Promise<string> {
  const contract = await prisma.contract.findFirst({
    where: { id: contractId, organizationId },
    include: {
      company: true,
      contact: true,
      template: true,
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  })

  if (!contract) throw new Error("החוזה לא נמצא")

  const latestVersion = contract.versions[0]
  const content = latestVersion?.content as Record<string, unknown> | undefined

  const parts: string[] = [
    `כותרת: ${contract.title}`,
    `סוג חוזה: ${contract.contractType}`,
    contract.industry ? `תעשייה: ${contract.industry}` : "",
    contract.company ? `חברה: ${contract.company.name}` : "",
    contract.company?.registrationNumber ? `ח.פ.: ${contract.company.registrationNumber}` : "",
    contract.company?.address ? `כתובת: ${contract.company.address}` : "",
    contract.contact ? `איש קשר: ${contract.contact.fullName}` : "",
    contract.contact?.email ? `אימייל: ${contract.contact.email}` : "",
    contract.amount ? `שווי: ${contract.amount} ${contract.currency}` : "",
    contract.startDate ? `תאריך התחלה: ${contract.startDate.toISOString().split("T")[0]}` : "",
    contract.endDate ? `תאריך סיום: ${contract.endDate.toISOString().split("T")[0]}` : "",
    contract.renewalDate ? `תאריך חידוש: ${contract.renewalDate.toISOString().split("T")[0]}` : "",
    contract.cancellationNoticeDays ? `ימי הודעה לביטול: ${contract.cancellationNoticeDays}` : "",
    contract.template ? `תבנית: ${contract.template.name}` : "",
  ].filter(Boolean)

  if (content) {
    if (content.paymentTerms) parts.push(`\nתנאי תשלום: ${content.paymentTerms}`)
    if (content.customNotes) parts.push(`\nהערות מיוחדות: ${content.customNotes}`)
    if (Array.isArray(content.clauses)) {
      parts.push("\n--- סעיפי החוזה ---")
      for (const clause of content.clauses as { title: string; content: string }[]) {
        parts.push(`\nסעיף: ${clause.title}\n${clause.content}`)
      }
    }
    if (content.templateContent && typeof content.templateContent === "object") {
      const tpl = content.templateContent as Record<string, unknown>
      if (Array.isArray(tpl.sections)) {
        parts.push("\n--- סעיפי תבנית ---")
        for (const section of tpl.sections as { title: string; content: string }[]) {
          parts.push(`\nסעיף: ${section.title}\n${section.content}`)
        }
      }
    }
  }

  return parts.join("\n")
}

async function createAuditLog(
  organizationId: string,
  contractId: string,
  action: string,
  metadata: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      organizationId,
      contractId,
      action,
      metadata: metadata as Prisma.InputJsonValue,
    },
  })
}

// --------------- Server Actions ---------------

export async function summarizeContract(contractId: string) {
  const { organizationId } = await getCurrentUser()
  const openai = getOpenAI()
  const text = await getContractText(contractId, organizationId)

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${SYSTEM_ROLE}

סכם את החוזה הבא. תן:
1. סיכום תמציתי של ההסכם
2. נקודות מפתח
3. תנאים עסקיים (סכום, מטבע, תאריכי התחלה/סיום/חידוש, הודעה לביטול)
4. הסבר בעברית פשוטה שכל אדם יכול להבין

אם מידע מסוים לא קיים, החזר null.${AI_DISCLAIMER}`,
        },
        { role: "user", content: text },
      ],
      response_format: zodResponseFormat(SummaryResponseSchema, "contract_summary"),
    })

    const result = JSON.parse(completion.choices[0].message.content!) as SummaryResponse

    const review = await prisma.aiReview.create({
      data: {
        organizationId,
        contractId,
        reviewType: "summary",
        summary: result.summary,
        findings: result as unknown as Prisma.InputJsonValue,
      },
    })

    await createAuditLog(organizationId, contractId, "AI_REVIEW_CREATED", { reviewType: "summary" })
    revalidatePath(`/contracts/${contractId}`)

    return { id: review.id, ...result }
  } catch (e) {
    if (e instanceof Error && e.message.includes("OPENAI_API_KEY")) throw e
    throw new Error("הניתוח נכשל. נסה שוב בעוד רגע.")
  }
}

export async function reviewContractRisks(contractId: string) {
  const { organizationId } = await getCurrentUser()
  const openai = getOpenAI()
  const text = await getContractText(contractId, organizationId)

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${SYSTEM_ROLE}

נתח את החוזה וזהה סיכונים. תן:
1. ציון סיכון מ-0 עד 100 (0 = ללא סיכון, 100 = סיכון קריטי)
2. סיכום קצר של מצב הסיכון
3. רשימת ממצאים - כל ממצא כולל: כותרת, חומרה (low/medium/high), קטגוריה (פיננסי/משפטי/תפעולי/ציות), הסבר, ותיקון מוצע

בדוק במיוחד:
- אחריות בלתי מוגבלת
- היעדר סעיף סודיות
- תנאי ביטול לא ברורים
- התחייבויות חד-צדדיות
- היעדר דין חל ושיפוט
- היקף עבודה לא מוגדר
- תנאי תשלום לא ברורים${AI_DISCLAIMER}`,
        },
        { role: "user", content: text },
      ],
      response_format: zodResponseFormat(RiskReviewSchema, "risk_review"),
    })

    const result = JSON.parse(completion.choices[0].message.content!) as RiskReview

    const review = await prisma.aiReview.create({
      data: {
        organizationId,
        contractId,
        reviewType: "risk",
        riskScore: result.riskScore,
        summary: result.summary,
        findings: result.findings as unknown as Prisma.InputJsonValue,
      },
    })

    await createAuditLog(organizationId, contractId, "AI_REVIEW_CREATED", {
      reviewType: "risk",
      riskScore: result.riskScore,
    })

    // Auto-create notifications for high-severity findings
    for (const finding of result.findings) {
      if (finding.severity !== "high") continue
      const exists = await prisma.notification.count({
        where: { organizationId, contractId, type: "AI_RISK_FOUND", title: `סיכון AI: ${finding.title}`, status: { in: ["UNREAD", "READ"] } },
      })
      if (exists === 0) {
        await prisma.notification.create({
          data: {
            organizationId, contractId,
            type: "AI_RISK_FOUND",
            title: `סיכון AI: ${finding.title}`,
            message: `${finding.explanation}\n\nתיקון מוצע: ${finding.suggestedFix}`,
            severity: "DANGER",
            actionUrl: `/contracts/${contractId}`,
          },
        })
      }
    }

    revalidatePath(`/contracts/${contractId}`)
    revalidatePath("/notifications")

    return { id: review.id, ...result }
  } catch (e) {
    if (e instanceof Error && e.message.includes("OPENAI_API_KEY")) throw e
    throw new Error("הניתוח נכשל. נסה שוב בעוד רגע.")
  }
}

export async function detectMissingClauses(contractId: string) {
  const { organizationId } = await getCurrentUser()
  const openai = getOpenAI()
  const text = await getContractText(contractId, organizationId)

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${SYSTEM_ROLE}

בדוק את החוזה וזהה סעיפים חסרים. עבור כל סעיף חסר ציין:
1. שם הסעיף
2. חשיבות (low/medium/high)
3. סיבה להוספה
4. טקסט מוצע בעברית

בדוק במיוחד האם חסרים:
- סעיף סודיות
- הגבלת אחריות
- תנאי ביטול וסיום
- דין חל ושיפוט
- כוח עליון
- קניין רוחני
- אי-תחרות
- שיפוי
- הודעות
- תנאי תשלום מפורטים
- נספח היקף עבודה${AI_DISCLAIMER}`,
        },
        { role: "user", content: text },
      ],
      response_format: zodResponseFormat(MissingClausesResponseSchema, "missing_clauses"),
    })

    const result = JSON.parse(completion.choices[0].message.content!) as MissingClausesResponse

    const review = await prisma.aiReview.create({
      data: {
        organizationId,
        contractId,
        reviewType: "missing_clauses",
        missingClauses: result.missingClauses as unknown as Prisma.InputJsonValue,
      },
    })

    await createAuditLog(organizationId, contractId, "AI_REVIEW_CREATED", { reviewType: "missing_clauses" })

    // Auto-create notifications for high-importance missing clauses
    for (const clause of result.missingClauses) {
      if (clause.importance !== "high") continue
      const exists = await prisma.notification.count({
        where: { organizationId, contractId, type: "MISSING_CLAUSE", title: `סעיף חסר: ${clause.clause}`, status: { in: ["UNREAD", "READ"] } },
      })
      if (exists === 0) {
        await prisma.notification.create({
          data: {
            organizationId, contractId,
            type: "MISSING_CLAUSE",
            title: `סעיף חסר: ${clause.clause}`,
            message: clause.reason,
            severity: "WARNING",
            actionUrl: `/contracts/${contractId}`,
          },
        })
      }
    }

    revalidatePath(`/contracts/${contractId}`)
    revalidatePath("/notifications")

    return { id: review.id, ...result }
  } catch (e) {
    if (e instanceof Error && e.message.includes("OPENAI_API_KEY")) throw e
    throw new Error("הניתוח נכשל. נסה שוב בעוד רגע.")
  }
}

export async function extractObligations(contractId: string) {
  const { organizationId } = await getCurrentUser()
  const openai = getOpenAI()
  const text = await getContractText(contractId, organizationId)

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${SYSTEM_ROLE}

חלץ את כל ההתחייבויות מהחוזה. עבור כל התחייבות ציין:
1. כותרת
2. סוג (payment/renewal/notice/deliverable/legal/other)
3. תאריך יעד (בפורמט YYYY-MM-DD או null)
4. אחראי (שם הצד האחראי או null)
5. תיאור
6. מקור (שם הסעיף שממנו חולצה ההתחייבות, או null)

חפש: תשלומים, חידושים, מועדי הודעה, אספקת שירותים, התחייבויות משפטיות, דיווחים.${AI_DISCLAIMER}`,
        },
        { role: "user", content: text },
      ],
      response_format: zodResponseFormat(ObligationsResponseSchema, "obligations"),
    })

    const result = JSON.parse(completion.choices[0].message.content!) as ObligationsResponse

    const review = await prisma.aiReview.create({
      data: {
        organizationId,
        contractId,
        reviewType: "obligations",
        obligations: result.obligations as unknown as Prisma.InputJsonValue,
      },
    })

    await createAuditLog(organizationId, contractId, "AI_REVIEW_CREATED", { reviewType: "obligations" })
    revalidatePath(`/contracts/${contractId}`)

    return { id: review.id, ...result }
  } catch (e) {
    if (e instanceof Error && e.message.includes("OPENAI_API_KEY")) throw e
    throw new Error("הניתוח נכשל. נסה שוב בעוד רגע.")
  }
}

export async function suggestClauseImprovements(contractId: string) {
  const { organizationId } = await getCurrentUser()
  const openai = getOpenAI()
  const text = await getContractText(contractId, organizationId)

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${SYSTEM_ROLE}

בדוק את סעיפי החוזה והצע שיפורים. עבור כל הצעה ציין:
1. הבעיה המקורית שזוהתה
2. כותרת לסעיף המוצע
3. טקסט מוצע לסעיף (בעברית משפטית ברורה)
4. סיבה לשיפור
5. רמת הפחתת סיכון (low/medium/high)

חפש:
- ניסוחים מעורפלים שצריך לחדד
- סעיפים חד-צדדיים שצריך לאזן
- מגבלות חסרות
- תנאים שלא מפורטים מספיק
- הגנות חסרות לאחד הצדדים${AI_DISCLAIMER}`,
        },
        { role: "user", content: text },
      ],
      response_format: zodResponseFormat(SuggestionsResponseSchema, "clause_suggestions"),
    })

    const result = JSON.parse(completion.choices[0].message.content!) as SuggestionsResponse

    const review = await prisma.aiReview.create({
      data: {
        organizationId,
        contractId,
        reviewType: "suggestions",
        suggestions: result.suggestions as unknown as Prisma.InputJsonValue,
      },
    })

    await createAuditLog(organizationId, contractId, "AI_REVIEW_CREATED", { reviewType: "suggestions" })
    revalidatePath(`/contracts/${contractId}`)

    return { id: review.id, ...result }
  } catch (e) {
    if (e instanceof Error && e.message.includes("OPENAI_API_KEY")) throw e
    throw new Error("הניתוח נכשל. נסה שוב בעוד רגע.")
  }
}

// --------------- Create Obligations from AI ---------------

export interface EnrichedAiObligation {
  title: string
  description: string
  obligationType: string
  dueDate: string | null
  ownerId: string | null
  departmentId: string | null
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  triggerType: string | null
  notifyBeforeDays: number | null
}

export async function createObligationsFromAi(
  contractId: string,
  obligations: Obligation[]
) {
  const { organizationId } = await getCurrentUser()

  const typeMap: Record<string, string> = {
    payment: "payment",
    renewal: "renewal",
    notice: "notice",
    deliverable: "delivery",
    legal: "compliance",
    other: "other",
  }

  const created = await Promise.all(
    obligations.map((ob) =>
      prisma.contractObligation.create({
        data: {
          contractId,
          title: ob.title,
          description: ob.description,
          obligationType: typeMap[ob.type] ?? "other",
          dueDate: ob.dueDate ? new Date(ob.dueDate) : null,
          source: "ai",
          status: "OPEN",
        },
      })
    )
  )

  await createAuditLog(organizationId, contractId, "AI_OBLIGATIONS_CREATED", {
    count: created.length,
  })

  revalidatePath(`/contracts/${contractId}`)
  return { count: created.length }
}

export async function createEnrichedObligationsFromAi(
  contractId: string,
  obligations: EnrichedAiObligation[]
) {
  const { organizationId } = await getCurrentUser()
  const now = new Date()

  const created = await Promise.all(
    obligations.map((ob) =>
      prisma.contractObligation.create({
        data: {
          contractId,
          title: ob.title,
          description: ob.description,
          obligationType: ob.obligationType,
          dueDate: ob.dueDate ? new Date(ob.dueDate) : null,
          ownerId: ob.ownerId || null,
          departmentId: ob.departmentId || null,
          priority: ob.priority,
          triggerType: (ob.triggerType as "DUE_DATE" | "RENEWAL_DATE" | "CANCELLATION_NOTICE" | "PAYMENT_DATE" | "DELIVERABLE_DATE" | "STATUS_CHANGE" | "SIGNATURE_PENDING" | "MANUAL") ?? null,
          notifyBeforeDays: ob.notifyBeforeDays,
          source: "ai",
          status: "OPEN",
        },
      })
    )
  )

  // Auto-create notifications for obligations that are due soon
  for (const ob of created) {
    if (!ob.dueDate) continue
    const daysUntilDue = Math.ceil(
      (ob.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    const notifyDays = ob.notifyBeforeDays ?? 7

    if (daysUntilDue < 0) {
      await prisma.notification.create({
        data: {
          organizationId,
          contractId,
          obligationId: ob.id,
          userId: ob.ownerId,
          departmentId: ob.departmentId,
          type: "OBLIGATION_DUE",
          title: "התחייבות AI באיחור",
          message: `"${ob.title}" באיחור של ${Math.abs(daysUntilDue)} ימים (נוצרה מניתוח AI).`,
          severity: "CRITICAL",
          actionUrl: `/contracts/${contractId}`,
          dueDate: ob.dueDate,
        },
      })
    } else if (daysUntilDue <= notifyDays) {
      const sev = ob.priority === "CRITICAL" ? "DANGER" as const : ob.priority === "HIGH" ? "WARNING" as const : "INFO" as const
      await prisma.notification.create({
        data: {
          organizationId,
          contractId,
          obligationId: ob.id,
          userId: ob.ownerId,
          departmentId: ob.departmentId,
          type: "OBLIGATION_DUE",
          title: "התחייבות AI מתקרבת",
          message: `"${ob.title}" בעוד ${daysUntilDue} ימים (נוצרה מניתוח AI).`,
          severity: sev,
          actionUrl: `/contracts/${contractId}`,
          dueDate: ob.dueDate,
        },
      })
    }
  }

  await createAuditLog(organizationId, contractId, "AI_OBLIGATIONS_ACCEPTED", {
    count: created.length,
    obligations: obligations.map((o) => ({ title: o.title, priority: o.priority, department: o.departmentId })),
  })

  revalidatePath(`/contracts/${contractId}`)
  revalidatePath("/obligations")
  revalidatePath("/notifications")
  revalidatePath("/dashboard")
  return { count: created.length }
}

// --------------- AI Risk → Notification ---------------

export async function createNotificationsFromRisks(
  contractId: string,
  riskResult: RiskReview
) {
  const { organizationId } = await getCurrentUser()
  let created = 0

  for (const finding of riskResult.findings) {
    if (finding.severity !== "high") continue
    const exists = await prisma.notification.count({
      where: {
        organizationId,
        contractId,
        type: "AI_RISK_FOUND",
        title: finding.title,
        status: { in: ["UNREAD", "READ"] },
      },
    })
    if (exists === 0) {
      await prisma.notification.create({
        data: {
          organizationId,
          contractId,
          type: "AI_RISK_FOUND",
          title: `סיכון AI: ${finding.title}`,
          message: `${finding.explanation}\n\nתיקון מוצע: ${finding.suggestedFix}`,
          severity: "DANGER",
          actionUrl: `/contracts/${contractId}`,
        },
      })
      created++
    }
  }

  if (created > 0) {
    revalidatePath("/notifications")
    revalidatePath("/dashboard")
  }
  return { created }
}

export async function createNotificationsFromMissingClauses(
  contractId: string,
  missingResult: MissingClausesResponse
) {
  const { organizationId } = await getCurrentUser()
  let created = 0

  for (const clause of missingResult.missingClauses) {
    if (clause.importance !== "high") continue
    const exists = await prisma.notification.count({
      where: {
        organizationId,
        contractId,
        type: "MISSING_CLAUSE",
        title: clause.clause,
        status: { in: ["UNREAD", "READ"] },
      },
    })
    if (exists === 0) {
      await prisma.notification.create({
        data: {
          organizationId,
          contractId,
          type: "MISSING_CLAUSE",
          title: `סעיף חסר: ${clause.clause}`,
          message: clause.reason,
          severity: "WARNING",
          actionUrl: `/contracts/${contractId}`,
        },
      })
      created++
    }
  }

  if (created > 0) {
    revalidatePath("/notifications")
    revalidatePath("/dashboard")
  }
  return { created }
}

// --------------- Get AI Reviews (history) ---------------

export async function getAiReviews(contractId: string): Promise<AiReviewRecord[]> {
  const { organizationId } = await getCurrentUser()
  const reviews = await prisma.aiReview.findMany({
    where: { contractId, organizationId },
    orderBy: { createdAt: "desc" },
  })
  return serializePrisma(reviews) as unknown as AiReviewRecord[]
}

// --------------- Dashboard: Latest AI Insights ---------------

export async function getLatestAiInsights() {
  const { organizationId } = await getCurrentUser()
  const reviews = await prisma.aiReview.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      contract: { select: { id: true, title: true } },
    },
  })

  return serializePrisma(reviews) as unknown as {
    id: string
    reviewType: string
    riskScore: number | null
    summary: string | null
    createdAt: string
    contract: { id: string; title: string }
  }[]
}
