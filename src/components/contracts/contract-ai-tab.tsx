"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Brain,
  ShieldAlert,
  SearchCheck,
  ListChecks,
  Sparkles,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  History,
  Calendar,
  Pencil,
  Zap,
} from "lucide-react"
import {
  summarizeContract,
  reviewContractRisks,
  detectMissingClauses,
  extractObligations,
  suggestClauseImprovements,
  createEnrichedObligationsFromAi,
  getAiReviews,
} from "@/actions/ai-review"
import type {
  SummaryResponse,
  RiskReview,
  MissingClausesResponse,
  ObligationsResponse,
  SuggestionsResponse,
  Obligation,
  AiReviewRecord,
  EnrichedAiObligation,
} from "@/actions/ai-review"
import { OBLIGATION_TYPES } from "@/lib/obligation-types"

interface ContractAiTabProps {
  contractId: string
  users: { id: string; fullName: string }[]
  departments: { id: string; name: string }[]
}

type SeverityLevel = "low" | "medium" | "high"

const severityColors: Record<SeverityLevel, string> = {
  low: "bg-[#DCFCE7] text-[#16A34A]",
  medium: "bg-[#FEF3C7] text-[#D97706]",
  high: "bg-[#FEE2E2] text-[#DC2626]",
}

const severityLabels: Record<SeverityLevel, string> = {
  low: "נמוך",
  medium: "בינוני",
  high: "גבוה",
}

const severityIcons: Record<SeverityLevel, typeof Info> = {
  low: Info,
  medium: AlertTriangle,
  high: AlertCircle,
}

const reviewTypeLabels: Record<string, string> = {
  summary: "סיכום חוזה",
  risk: "בדיקת סיכונים",
  missing_clauses: "סעיפים חסרים",
  obligations: "חילוץ התחייבויות",
  suggestions: "הצעות לשיפור",
}

const selectClass =
  "flex h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"

export function ContractAiTab({ contractId, users, departments }: ContractAiTabProps) {
  const [summaryResult, setSummaryResult] = useState<SummaryResponse | null>(null)
  const [riskResult, setRiskResult] = useState<RiskReview | null>(null)
  const [missingResult, setMissingResult] = useState<MissingClausesResponse | null>(null)
  const [obligationsResult, setObligationsResult] = useState<ObligationsResponse | null>(null)
  const [suggestionsResult, setSuggestionsResult] = useState<SuggestionsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [obligationsCreated, setObligationsCreated] = useState(false)
  const [history, setHistory] = useState<AiReviewRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Editable obligation state
  const [editableObligations, setEditableObligations] = useState<EnrichedAiObligation[]>([])

  const [isSummarizing, startSummarize] = useTransition()
  const [isReviewingRisks, startRiskReview] = useTransition()
  const [isDetectingMissing, startMissingClauses] = useTransition()
  const [isExtracting, startExtract] = useTransition()
  const [isSuggesting, startSuggest] = useTransition()
  const [isCreatingObs, startCreateObs] = useTransition()
  const [isLoadingHistory, startLoadHistory] = useTransition()

  const isAnyLoading =
    isSummarizing || isReviewingRisks || isDetectingMissing || isExtracting || isSuggesting || isCreatingObs

  useEffect(() => {
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function loadHistory() {
    startLoadHistory(async () => {
      try {
        const reviews = await getAiReviews(contractId)
        setHistory(reviews)
      } catch {
        // silent
      }
    })
  }

  function handleSummarize() {
    setError(null)
    startSummarize(async () => {
      try {
        const res = await summarizeContract(contractId)
        setSummaryResult(res)
        loadHistory()
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה בסיכום החוזה")
      }
    })
  }

  function handleRiskReview() {
    setError(null)
    startRiskReview(async () => {
      try {
        const res = await reviewContractRisks(contractId)
        setRiskResult(res)
        loadHistory()
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה בבדיקת סיכונים")
      }
    })
  }

  function handleMissingClauses() {
    setError(null)
    startMissingClauses(async () => {
      try {
        const res = await detectMissingClauses(contractId)
        setMissingResult(res)
        loadHistory()
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה באיתור סעיפים חסרים")
      }
    })
  }

  function handleExtractObligations() {
    setError(null)
    setObligationsCreated(false)
    startExtract(async () => {
      try {
        const res = await extractObligations(contractId)
        setObligationsResult(res)
        // Initialize editable state from AI results
        setEditableObligations(
          res.obligations.map((ob) => ({
            title: ob.title,
            description: ob.description,
            obligationType: mapAiTypeToSlug(ob.type),
            dueDate: ob.dueDate || null,
            ownerId: null,
            departmentId: null,
            priority: "MEDIUM" as const,
            triggerType: guessTriggerType(ob.type),
            notifyBeforeDays: 7,
          }))
        )
        loadHistory()
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה בחילוץ התחייבויות")
      }
    })
  }

  function handleSuggest() {
    setError(null)
    startSuggest(async () => {
      try {
        const res = await suggestClauseImprovements(contractId)
        setSuggestionsResult(res)
        loadHistory()
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה בהצעות לשיפור")
      }
    })
  }

  function handleCreateEnrichedObligations() {
    if (editableObligations.length === 0) return
    startCreateObs(async () => {
      try {
        await createEnrichedObligationsFromAi(contractId, editableObligations)
        setObligationsCreated(true)
        loadHistory()
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה ביצירת התחייבויות")
      }
    })
  }

  function updateObligation(index: number, patch: Partial<EnrichedAiObligation>) {
    setEditableObligations((prev) =>
      prev.map((ob, i) => (i === index ? { ...ob, ...patch } : ob))
    )
  }

  function removeObligation(index: number) {
    setEditableObligations((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB]">
            <Brain className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">בינה חוזית</h3>
            <p className="text-xs text-[#94A3B8]">ניתוח אוטומטי של ההסכם לצורך סיכום, איתור סיכונים, סעיפים חסרים והתחייבויות.</p>
          </div>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
        >
          <History className="size-3.5" />
          היסטוריה ({history.length})
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ActionButton icon={Sparkles} label="סיכום חוזה" description="סיכום תמציתי ותנאים עסקיים" onClick={handleSummarize} isLoading={isSummarizing} disabled={isAnyLoading} color="from-[#2563EB] to-[#3B82F6]" />
        <ActionButton icon={ShieldAlert} label="בדיקת סיכונים" description="זיהוי סיכונים + התראות אוטומטיות" onClick={handleRiskReview} isLoading={isReviewingRisks} disabled={isAnyLoading} color="from-[#DC2626] to-[#EF4444]" />
        <ActionButton icon={SearchCheck} label="איתור סעיפים חסרים" description="בדיקת שלמות + התראות אוטומטיות" onClick={handleMissingClauses} isLoading={isDetectingMissing} disabled={isAnyLoading} color="from-[#D97706] to-[#F59E0B]" />
        <ActionButton icon={ListChecks} label="חילוץ התחייבויות" description="חילוץ → עריכה → שיוך למחלקה" onClick={handleExtractObligations} isLoading={isExtracting} disabled={isAnyLoading} color="from-[#16A34A] to-[#22C55E]" />
        <ActionButton icon={Lightbulb} label="הצעות לשיפור סעיפים" description="שיפור ניסוחים והפחתת סיכונים" onClick={handleSuggest} isLoading={isSuggesting} disabled={isAnyLoading} color="from-[#7C3AED] to-[#A855F7]" />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {summaryResult && <SummaryCard data={summaryResult} />}
      {riskResult && <RiskCard data={riskResult} />}
      {missingResult && <MissingClausesCard data={missingResult} />}
      {obligationsResult && (
        <EditableObligationsCard
          rawObligations={obligationsResult.obligations}
          editableObligations={editableObligations}
          onUpdate={updateObligation}
          onRemove={removeObligation}
          onCreateAll={handleCreateEnrichedObligations}
          isCreating={isCreatingObs}
          created={obligationsCreated}
          users={users}
          departments={departments}
        />
      )}
      {suggestionsResult && <SuggestionsCard data={suggestionsResult} />}

      {/* Disclaimer */}
      {(summaryResult || riskResult || missingResult || obligationsResult || suggestionsResult) && (
        <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
          <p className="text-[11px] text-[#94A3B8] text-center leading-relaxed">
            הבדיקה מבוססת על ניתוח אוטומטי ואינה מהווה ייעוץ משפטי. יש לוודא מול יועץ משפטי.
          </p>
        </div>
      )}

      {/* History */}
      {showHistory && (
        <HistorySection reviews={history} isLoading={isLoadingHistory} />
      )}
    </div>
  )
}

// --------------- Helpers ---------------

function mapAiTypeToSlug(aiType: string): string {
  const map: Record<string, string> = {
    payment: "payment",
    renewal: "renewal",
    notice: "cancellation_notice",
    deliverable: "deliverable",
    legal: "legal_review",
    other: "other",
  }
  return map[aiType] ?? "other"
}

function guessTriggerType(aiType: string): string | null {
  const map: Record<string, string> = {
    payment: "PAYMENT_DATE",
    renewal: "RENEWAL_DATE",
    notice: "CANCELLATION_NOTICE",
    deliverable: "DELIVERABLE_DATE",
    legal: "DUE_DATE",
    other: "DUE_DATE",
  }
  return map[aiType] ?? null
}

// --------------- Action Button ---------------

function ActionButton({
  icon: Icon, label, description, onClick, isLoading, disabled, color,
}: {
  icon: typeof Sparkles; label: string; description: string; onClick: () => void; isLoading: boolean; disabled: boolean; color: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative flex items-center gap-3 rounded-xl border border-[#E2E8F0] p-4 text-start transition-all hover:border-[#CBD5E1] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color} transition-transform group-hover:scale-105`}>
        {isLoading ? <Loader2 className="size-5 text-white animate-spin" /> : <Icon className="size-5 text-white" />}
      </div>
      <div>
        <p className="text-sm font-bold text-[#0F172A]">{label}</p>
        <p className="text-xs text-[#94A3B8]">{description}</p>
      </div>
    </button>
  )
}

// --------------- Summary Card ---------------

function SummaryCard({ data }: { data: SummaryResponse }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <ResultCard title="סיכום החוזה" icon={Sparkles} color="bg-[#DBEAFE] text-[#2563EB]" expanded={expanded} onToggle={() => setExpanded(!expanded)}>
      <p className="text-sm text-[#334155] leading-relaxed">{data.summary}</p>

      {data.keyPoints.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-bold text-[#64748B]">נקודות מפתח</p>
          <ul className="space-y-1.5">
            {data.keyPoints.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#334155]">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-[#2563EB]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <TermCard label="סכום" value={data.businessTerms.amount} />
        <TermCard label="מטבע" value={data.businessTerms.currency} />
        <TermCard label="תאריך התחלה" value={data.businessTerms.startDate} />
        <TermCard label="תאריך סיום" value={data.businessTerms.endDate} />
        <TermCard label="תאריך חידוש" value={data.businessTerms.renewalDate} />
        <TermCard label="הודעה לביטול" value={data.businessTerms.cancellationNotice} />
      </div>

      {data.plainHebrewExplanation && (
        <div className="mt-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] p-4">
          <p className="text-[10px] font-bold text-[#2563EB] mb-1.5">בעברית פשוטה</p>
          <p className="text-sm text-[#1E40AF] leading-relaxed">{data.plainHebrewExplanation}</p>
        </div>
      )}
    </ResultCard>
  )
}

function TermCard({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="rounded-lg bg-[#F8FAFC] p-3">
      <p className="text-[10px] font-bold text-[#94A3B8] mb-1">{label}</p>
      <p className="text-xs font-semibold text-[#334155]">{value}</p>
    </div>
  )
}

// --------------- Risk Card ---------------

function RiskCard({ data }: { data: RiskReview }) {
  const [expanded, setExpanded] = useState(true)

  const scoreColor = data.riskScore <= 30 ? "text-[#16A34A]" : data.riskScore <= 60 ? "text-[#D97706]" : "text-[#DC2626]"
  const scoreLabel = data.riskScore <= 30 ? "סיכון נמוך" : data.riskScore <= 60 ? "סיכון בינוני" : "סיכון גבוה"
  const strokeColor = data.riskScore <= 30 ? "#16A34A" : data.riskScore <= 60 ? "#D97706" : "#DC2626"

  return (
    <ResultCard title="ניתוח סיכונים" icon={ShieldAlert} color="bg-[#FEE2E2] text-[#DC2626]" expanded={expanded} onToggle={() => setExpanded(!expanded)}>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex size-20 items-center justify-center">
          <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="#E2E8F0" strokeWidth="6" />
            <circle cx="40" cy="40" r="35" fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(data.riskScore / 100) * 220} 220`} />
          </svg>
          <span className={`absolute text-lg font-extrabold ${scoreColor}`}>{data.riskScore}</span>
        </div>
        <div>
          <p className={`text-sm font-bold ${scoreColor}`}>{scoreLabel}</p>
          <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {data.findings.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#64748B]">ממצאים ({data.findings.length})</p>
          {data.findings.map((finding, i) => {
            const SIcon = severityIcons[finding.severity]
            return (
              <div key={i} className="rounded-xl border border-[#E2E8F0] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SIcon className="size-4" style={{ color: finding.severity === "high" ? "#DC2626" : finding.severity === "medium" ? "#D97706" : "#16A34A" }} />
                    <p className="text-sm font-bold text-[#0F172A]">{finding.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-[10px] font-semibold rounded-lg bg-[#F1F5F9] text-[#64748B]">{finding.category}</Badge>
                    <Badge className={`text-[10px] font-bold rounded-lg ${severityColors[finding.severity]}`}>{severityLabels[finding.severity]}</Badge>
                    {finding.severity === "high" && (
                      <Badge className="text-[10px] font-bold rounded-lg bg-[#DC2626] text-white">התראה נוצרה</Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">{finding.explanation}</p>
                <div className="rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] p-3">
                  <p className="text-[10px] font-bold text-[#16A34A] mb-1">תיקון מוצע</p>
                  <p className="text-xs text-[#166534] leading-relaxed">{finding.suggestedFix}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ResultCard>
  )
}

// --------------- Missing Clauses Card ---------------

function MissingClausesCard({ data }: { data: MissingClausesResponse }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <ResultCard title="סעיפים חסרים" icon={SearchCheck} color="bg-[#FEF3C7] text-[#D97706]" expanded={expanded} onToggle={() => setExpanded(!expanded)}>
      {data.missingClauses.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle2 className="size-8 text-[#16A34A] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#16A34A]">לא נמצאו סעיפים חסרים</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.missingClauses.map((clause, i) => (
            <div key={i} className="rounded-xl border border-[#E2E8F0] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#0F172A]">{clause.clause}</p>
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] font-bold rounded-lg ${severityColors[clause.importance]}`}>{severityLabels[clause.importance]}</Badge>
                  {clause.importance === "high" && (
                    <Badge className="text-[10px] font-bold rounded-lg bg-[#D97706] text-white">התראה נוצרה</Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">{clause.reason}</p>
              <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-3">
                <p className="text-[10px] font-bold text-[#94A3B8] mb-1">טקסט מוצע</p>
                <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">{clause.suggestedText}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ResultCard>
  )
}

// --------------- Editable Obligations Card ---------------

function EditableObligationsCard({
  rawObligations,
  editableObligations,
  onUpdate,
  onRemove,
  onCreateAll,
  isCreating,
  created,
  users,
  departments,
}: {
  rawObligations: Obligation[]
  editableObligations: EnrichedAiObligation[]
  onUpdate: (i: number, patch: Partial<EnrichedAiObligation>) => void
  onRemove: (i: number) => void
  onCreateAll: () => void
  isCreating: boolean
  created: boolean
  users: { id: string; fullName: string }[]
  departments: { id: string; name: string }[]
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <ResultCard title="התחייבויות שזוהו" icon={ListChecks} color="bg-[#DCFCE7] text-[#16A34A]" expanded={expanded} onToggle={() => setExpanded(!expanded)}>
      {editableObligations.length === 0 && !created ? (
        <div className="text-center py-6">
          <p className="text-sm text-[#94A3B8]">לא נמצאו התחייבויות</p>
        </div>
      ) : created ? (
        <div className="flex items-center gap-2 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] p-4">
          <CheckCircle2 className="size-5 text-[#16A34A]" />
          <div>
            <p className="text-sm font-bold text-[#16A34A]">
              {rawObligations.length} התחייבויות נוצרו בהצלחה עם טריגרים והתראות
            </p>
            <p className="text-xs text-[#166534] mt-0.5">ההתחייבויות שויכו למחלקות ואחראים. התראות נוצרו אוטומטית עבור מועדים קרובים.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] p-3 mb-4">
            <div className="flex items-center gap-2">
              <Pencil className="size-4 text-[#2563EB]" />
              <p className="text-xs text-[#1E40AF] font-medium">
                ערוך כל התחייבות — שייך מחלקה, אחראי, עדיפות וטריגר לפני יצירה.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {editableObligations.map((ob, i) => (
              <div key={i} className="rounded-xl border border-[#E2E8F0] p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <Badge className="text-[10px] font-bold rounded-lg bg-[#DBEAFE] text-[#2563EB]">
                    #{i + 1} — AI
                  </Badge>
                  <button
                    onClick={() => onRemove(i)}
                    className="text-[10px] text-[#94A3B8] hover:text-[#DC2626] font-medium transition-colors"
                  >
                    הסר
                  </button>
                </div>

                {/* Title + Description */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-[#64748B]">כותרת</Label>
                    <Input
                      value={ob.title}
                      onChange={(e) => onUpdate(i, { title: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-[#64748B]">סוג התחייבות</Label>
                    <select
                      value={ob.obligationType}
                      onChange={(e) => onUpdate(i, { obligationType: e.target.value })}
                      className={selectClass}
                    >
                      {OBLIGATION_TYPES.map((t) => (
                        <option key={t.slug} value={t.slug}>{t.hebrewName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-[#64748B]">תיאור</Label>
                  <Textarea
                    value={ob.description}
                    onChange={(e) => onUpdate(i, { description: e.target.value })}
                    className="text-xs min-h-[40px]"
                    rows={2}
                  />
                </div>

                {/* Department + Owner + Priority */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-[#64748B]">מחלקה</Label>
                    <select
                      value={ob.departmentId ?? ""}
                      onChange={(e) => onUpdate(i, { departmentId: e.target.value || null })}
                      className={selectClass}
                    >
                      <option value="">ללא</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-[#64748B]">אחראי</Label>
                    <select
                      value={ob.ownerId ?? ""}
                      onChange={(e) => onUpdate(i, { ownerId: e.target.value || null })}
                      className={selectClass}
                    >
                      <option value="">ללא</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-[#64748B]">עדיפות</Label>
                    <select
                      value={ob.priority}
                      onChange={(e) => onUpdate(i, { priority: e.target.value as EnrichedAiObligation["priority"] })}
                      className={selectClass}
                    >
                      <option value="LOW">נמוך</option>
                      <option value="MEDIUM">בינוני</option>
                      <option value="HIGH">גבוה</option>
                      <option value="CRITICAL">קריטי</option>
                    </select>
                  </div>
                </div>

                {/* Due date + Trigger + NotifyBefore */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-[#64748B]">תאריך יעד</Label>
                    <Input
                      type="date"
                      value={ob.dueDate ?? ""}
                      onChange={(e) => onUpdate(i, { dueDate: e.target.value || null })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-[#64748B]">סוג טריגר</Label>
                    <select
                      value={ob.triggerType ?? ""}
                      onChange={(e) => onUpdate(i, { triggerType: e.target.value || null })}
                      className={selectClass}
                    >
                      <option value="">ללא</option>
                      <option value="DUE_DATE">תאריך יעד</option>
                      <option value="RENEWAL_DATE">חידוש</option>
                      <option value="CANCELLATION_NOTICE">הודעת ביטול</option>
                      <option value="PAYMENT_DATE">תשלום</option>
                      <option value="DELIVERABLE_DATE">מסירה</option>
                      <option value="STATUS_CHANGE">שינוי סטטוס</option>
                      <option value="SIGNATURE_PENDING">חתימה</option>
                      <option value="MANUAL">ידני</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-[#64748B]">התראה לפני (ימים)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={365}
                      value={ob.notifyBeforeDays ?? ""}
                      onChange={(e) => onUpdate(i, { notifyBeforeDays: e.target.value ? parseInt(e.target.value) : null })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
            <Button
              onClick={onCreateAll}
              disabled={isCreating || editableObligations.length === 0}
              className="w-full bg-gradient-to-l from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white rounded-xl gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  יוצר התחייבויות וטריגרים...
                </>
              ) : (
                <>
                  <Zap className="size-4" />
                  צור התחייבויות וטריגרים ({editableObligations.length})
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </ResultCard>
  )
}

// --------------- Suggestions Card ---------------

function SuggestionsCard({ data }: { data: SuggestionsResponse }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <ResultCard title="הצעות לשיפור סעיפים" icon={Lightbulb} color="bg-[#EDE9FE] text-[#7C3AED]" expanded={expanded} onToggle={() => setExpanded(!expanded)}>
      {data.suggestions.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle2 className="size-8 text-[#16A34A] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#16A34A]">לא נמצאו הצעות לשיפור</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.suggestions.map((sug, i) => (
            <div key={i} className="rounded-xl border border-[#E2E8F0] p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#0F172A]">{sug.suggestedClauseTitle}</p>
                  <p className="text-xs text-[#DC2626] font-medium">בעיה: {sug.originalIssue}</p>
                </div>
                <Badge className={`text-[10px] font-bold rounded-lg shrink-0 ${severityColors[sug.riskReduction]}`}>
                  הפחתה: {severityLabels[sug.riskReduction]}
                </Badge>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">{sug.reason}</p>
              <div className="rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] p-3">
                <p className="text-[10px] font-bold text-[#7C3AED] mb-1">טקסט מוצע</p>
                <p className="text-xs text-[#4C1D95] leading-relaxed whitespace-pre-wrap">{sug.suggestedClauseText}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ResultCard>
  )
}

// --------------- History Section ---------------

function HistorySection({ reviews, isLoading }: { reviews: AiReviewRecord[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-center gap-2 text-sm text-[#94A3B8]">
          <Loader2 className="size-4 animate-spin" />
          <span>טוען היסטוריה...</span>
        </div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E2E8F0] p-6 text-center">
        <History className="size-8 text-[#94A3B8] mx-auto mb-2" />
        <p className="text-sm text-[#94A3B8] font-medium">עדיין לא בוצע ניתוח AI</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <History className="size-4 text-[#64748B]" />
          <span className="text-sm font-bold text-[#0F172A]">ניתוחים קודמים ({reviews.length})</span>
        </div>
      </div>
      <div className="divide-y divide-[#E2E8F0]">
        {reviews.map((review) => (
          <div key={review.id} className="px-4 py-3 hover:bg-[#F8FAFC] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="text-[10px] font-bold rounded-lg bg-[#DBEAFE] text-[#2563EB]">
                  {reviewTypeLabels[review.reviewType] ?? review.reviewType}
                </Badge>
                {review.riskScore !== null && (
                  <Badge className={`text-[10px] font-bold rounded-lg ${review.riskScore <= 30 ? "bg-[#DCFCE7] text-[#16A34A]" : review.riskScore <= 60 ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>
                    ציון: {review.riskScore}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                <Calendar className="size-3" />
                <span>{new Date(review.createdAt).toLocaleDateString("he-IL")}</span>
              </div>
            </div>
            {review.summary && (
              <p className="mt-1.5 text-xs text-[#64748B] line-clamp-2 leading-relaxed">{review.summary}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// --------------- Result Card Wrapper ---------------

function ResultCard({
  title, icon: Icon, color, expanded, onToggle, children,
}: {
  title: string; icon: typeof Sparkles; color: string; expanded: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 hover:bg-[#F8FAFC] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`flex size-7 items-center justify-center rounded-lg ${color}`}>
            <Icon className="size-4" />
          </div>
          <span className="text-sm font-bold text-[#0F172A]">{title}</span>
        </div>
        {expanded ? <ChevronUp className="size-4 text-[#94A3B8]" /> : <ChevronDown className="size-4 text-[#94A3B8]" />}
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}
