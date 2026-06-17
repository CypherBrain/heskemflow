"use client"

import { useState, useTransition, useRef, useCallback } from "react"
import { Copy, Download, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createVersionWithSnapshot } from "@/actions/contracts"

export interface VersionContentData {
  title?: string
  contractType?: string
  industry?: string | null
  templateName?: string | null
  templateContent?: unknown
  company?: {
    name: string
    registrationNumber?: string | null
    address?: string | null
  } | null
  contact?: {
    fullName: string
    email?: string | null
    phone?: string | null
    title?: string | null
    isSignatory?: boolean
  } | null
  amount?: number | null
  currency?: string
  startDate?: string | null
  endDate?: string | null
  renewalDate?: string | null
  cancellationNoticeDays?: number | null
  paymentTerms?: string | null
  customNotes?: string | null
  clauses?: {
    id: string
    title: string
    category: string
    content: string
  }[]
}

interface ContractDocumentTabProps {
  contractId: string
  contractTitle: string
  versionNumber: number
  versionCreatedAt: string
  content: VersionContentData
}

function formatDateHe(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleDateString("he-IL")
  } catch {
    return dateStr
  }
}

function formatCurrencySymbol(currency: string | undefined): string {
  switch (currency) {
    case "ILS": return "₪"
    case "USD": return "$"
    case "EUR": return "€"
    default: return currency ?? "₪"
  }
}

function buildPlainText(content: VersionContentData, versionNumber: number): string {
  const lines: string[] = []

  lines.push("═".repeat(50))
  lines.push(content.title ?? "חוזה")
  lines.push("═".repeat(50))
  lines.push("")
  lines.push(`גרסה: ${versionNumber}`)
  lines.push(`סוג חוזה: ${content.contractType ?? "—"}`)
  if (content.industry) lines.push(`תעשייה: ${content.industry}`)
  if (content.templateName) lines.push(`תבנית: ${content.templateName}`)
  lines.push("")

  lines.push("── צדדים לחוזה ──")
  lines.push("")
  if (content.company) {
    lines.push(`חברה: ${content.company.name}`)
    if (content.company.registrationNumber)
      lines.push(`מספר רישום: ${content.company.registrationNumber}`)
    if (content.company.address)
      lines.push(`כתובת: ${content.company.address}`)
  }
  if (content.contact) {
    lines.push("")
    lines.push(`איש קשר: ${content.contact.fullName}`)
    if (content.contact.title) lines.push(`תפקיד: ${content.contact.title}`)
    if (content.contact.email) lines.push(`אימייל: ${content.contact.email}`)
    if (content.contact.phone) lines.push(`טלפון: ${content.contact.phone}`)
    if (content.contact.isSignatory) lines.push("חותם: כן")
  }
  lines.push("")

  lines.push("── תנאים מסחריים ──")
  lines.push("")
  if (content.amount != null) {
    lines.push(`סכום: ${formatCurrencySymbol(content.currency)}${Number(content.amount).toLocaleString("he-IL")}`)
  }
  lines.push(`מטבע: ${content.currency ?? "ILS"}`)
  lines.push(`תאריך התחלה: ${formatDateHe(content.startDate)}`)
  lines.push(`תאריך סיום: ${formatDateHe(content.endDate)}`)
  lines.push(`תאריך חידוש: ${formatDateHe(content.renewalDate)}`)
  if (content.cancellationNoticeDays != null)
    lines.push(`ימי הודעה מראש לביטול: ${content.cancellationNoticeDays}`)
  if (content.paymentTerms)
    lines.push(`תנאי תשלום: ${content.paymentTerms}`)
  lines.push("")

  if (content.clauses && content.clauses.length > 0) {
    lines.push("── סעיפי החוזה ──")
    lines.push("")
    content.clauses.forEach((clause, i) => {
      lines.push(`${i + 1}. ${clause.title} [${clause.category}]`)
      lines.push(clause.content)
      lines.push("")
    })
  }

  if (content.customNotes) {
    lines.push("── הערות ──")
    lines.push("")
    lines.push(content.customNotes)
    lines.push("")
  }

  lines.push("═".repeat(50))
  return lines.join("\n")
}

function buildHtmlDocument(content: VersionContentData, versionNumber: number, createdAt: string): string {
  const clausesHtml = (content.clauses ?? [])
    .map(
      (c, i) => `
      <div style="margin-bottom:20px;">
        <h3 style="margin:0 0 6px; font-size:15px; color:#0F172A;">${i + 1}. ${c.title} <span style="font-size:12px; color:#64748B;">[${c.category}]</span></h3>
        <p style="margin:0; font-size:14px; color:#334155; line-height:1.8; white-space:pre-wrap;">${c.content}</p>
      </div>`
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${content.title ?? "חוזה"}</title>
<style>
  body { font-family: "Segoe UI", Tahoma, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #0F172A; direction: rtl; }
  .header { text-align: center; border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { margin: 0; font-size: 24px; }
  .meta { font-size: 12px; color: #64748B; margin-top: 8px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 16px; font-weight: 700; color: #2563EB; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 12px; }
  .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .row-label { color: #64748B; }
  .row-value { font-weight: 600; }
  .notes { font-size: 14px; line-height: 1.8; color: #334155; white-space: pre-wrap; }
</style>
</head>
<body>
  <div class="header">
    <h1>${content.title ?? "חוזה"}</h1>
    <div class="meta">גרסה ${versionNumber} • ${formatDateHe(createdAt)} • ${content.contractType ?? ""}</div>
  </div>

  <div class="section">
    <div class="section-title">צדדים לחוזה</div>
    ${content.company ? `
    <div class="row"><span class="row-label">חברה</span><span class="row-value">${content.company.name}</span></div>
    ${content.company.registrationNumber ? `<div class="row"><span class="row-label">מספר רישום</span><span class="row-value">${content.company.registrationNumber}</span></div>` : ""}
    ${content.company.address ? `<div class="row"><span class="row-label">כתובת</span><span class="row-value">${content.company.address}</span></div>` : ""}
    ` : ""}
    ${content.contact ? `
    <div class="row"><span class="row-label">איש קשר</span><span class="row-value">${content.contact.fullName}</span></div>
    ${content.contact.title ? `<div class="row"><span class="row-label">תפקיד</span><span class="row-value">${content.contact.title}</span></div>` : ""}
    ${content.contact.email ? `<div class="row"><span class="row-label">אימייל</span><span class="row-value">${content.contact.email}</span></div>` : ""}
    ${content.contact.phone ? `<div class="row"><span class="row-label">טלפון</span><span class="row-value">${content.contact.phone}</span></div>` : ""}
    ${content.contact.isSignatory ? `<div class="row"><span class="row-label">חותם</span><span class="row-value">כן</span></div>` : ""}
    ` : ""}
  </div>

  <div class="section">
    <div class="section-title">תנאים מסחריים</div>
    ${content.amount != null ? `<div class="row"><span class="row-label">סכום</span><span class="row-value">${formatCurrencySymbol(content.currency)}${Number(content.amount).toLocaleString("he-IL")}</span></div>` : ""}
    <div class="row"><span class="row-label">מטבע</span><span class="row-value">${content.currency ?? "ILS"}</span></div>
    <div class="row"><span class="row-label">תאריך התחלה</span><span class="row-value">${formatDateHe(content.startDate)}</span></div>
    <div class="row"><span class="row-label">תאריך סיום</span><span class="row-value">${formatDateHe(content.endDate)}</span></div>
    <div class="row"><span class="row-label">תאריך חידוש</span><span class="row-value">${formatDateHe(content.renewalDate)}</span></div>
    ${content.cancellationNoticeDays != null ? `<div class="row"><span class="row-label">ימי הודעה לביטול</span><span class="row-value">${content.cancellationNoticeDays}</span></div>` : ""}
    ${content.paymentTerms ? `<div class="row"><span class="row-label">תנאי תשלום</span><span class="row-value">${content.paymentTerms}</span></div>` : ""}
  </div>

  ${(content.clauses ?? []).length > 0 ? `
  <div class="section">
    <div class="section-title">סעיפי החוזה</div>
    ${clausesHtml}
  </div>
  ` : ""}

  ${content.customNotes ? `
  <div class="section">
    <div class="section-title">הערות</div>
    <div class="notes">${content.customNotes}</div>
  </div>
  ` : ""}
</body>
</html>`
}

export function ContractDocumentTab({
  contractId,
  contractTitle,
  versionNumber,
  versionCreatedAt,
  content,
}: ContractDocumentTabProps) {
  const [copied, setCopied] = useState(false)
  const [versionOpen, setVersionOpen] = useState(false)
  const [changeSummary, setChangeSummary] = useState("")
  const [isPending, startTransition] = useTransition()
  const docRef = useRef<HTMLDivElement>(null)

  const handleCopyText = useCallback(() => {
    const text = buildPlainText(content, versionNumber)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [content, versionNumber])

  const handleDownloadHtml = useCallback(() => {
    const html = buildHtmlDocument(content, versionNumber, versionCreatedAt)
    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${contractTitle.replace(/\s+/g, "_")}_v${versionNumber}.html`
    a.click()
    URL.revokeObjectURL(url)
  }, [content, versionNumber, versionCreatedAt, contractTitle])

  function handleCreateVersion() {
    if (!changeSummary.trim()) return
    startTransition(async () => {
      await createVersionWithSnapshot({
        contractId,
        changeSummary: changeSummary.trim(),
      })
      setChangeSummary("")
      setVersionOpen(false)
    })
  }

  const clauses = content.clauses ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge className="text-xs font-bold rounded-lg bg-[#DBEAFE] text-[#2563EB]">
            v{versionNumber}
          </Badge>
          <span className="text-xs text-[#94A3B8]">
            {formatDateHe(versionCreatedAt)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={versionOpen} onOpenChange={setVersionOpen}>
            <DialogTrigger render={
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs" />
            }>
              <Plus className="size-3.5" />
              יצירת גרסה חדשה
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>יצירת גרסה חדשה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>תיאור השינויים</Label>
                  <Textarea
                    value={changeSummary}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    placeholder="מה השתנה בגרסה זו?"
                  />
                </div>
                <Button
                  onClick={handleCreateVersion}
                  disabled={isPending || !changeSummary.trim()}
                  className="w-full"
                >
                  {isPending ? "שומר..." : "צור גרסה"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 text-xs"
            onClick={handleCopyText}
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            {copied ? "הועתק!" : "העתק טקסט חוזה"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 text-xs"
            onClick={handleDownloadHtml}
          >
            <Download className="size-3.5" />
            הורדת HTML
          </Button>
        </div>
      </div>

      <div
        ref={docRef}
        className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden"
      >
        {/* Document Header */}
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5 text-center">
          <h2 className="text-xl font-extrabold text-[#0F172A]">
            {content.title ?? contractTitle}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-3 text-xs text-[#64748B]">
            <span>גרסה {versionNumber}</span>
            <span>•</span>
            <span>{formatDateHe(versionCreatedAt)}</span>
            {content.contractType && (
              <>
                <span>•</span>
                <span>{content.contractType}</span>
              </>
            )}
            {content.industry && (
              <>
                <span>•</span>
                <span>{content.industry}</span>
              </>
            )}
          </div>
          {content.templateName && (
            <p className="mt-1 text-[11px] text-[#94A3B8]">
              תבנית: {content.templateName}
            </p>
          )}
        </div>

        {/* Parties */}
        <div className="border-b border-[#E2E8F0] px-6 py-5">
          <h3 className="text-sm font-bold text-[#2563EB] mb-3">צדדים לחוזה</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            {content.company && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">חברה</p>
                <DocField label="שם" value={content.company.name} />
                <DocField label="מספר רישום" value={content.company.registrationNumber} />
                <DocField label="כתובת" value={content.company.address} />
              </div>
            )}
            {content.contact && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">איש קשר / חותם</p>
                <DocField label="שם" value={content.contact.fullName} />
                <DocField label="תפקיד" value={content.contact.title} />
                <DocField label="אימייל" value={content.contact.email} />
                <DocField label="טלפון" value={content.contact.phone} />
                {content.contact.isSignatory && (
                  <p className="text-xs text-emerald-600 font-semibold">מורשה חתימה</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Commercial Terms */}
        <div className="border-b border-[#E2E8F0] px-6 py-5">
          <h3 className="text-sm font-bold text-[#2563EB] mb-3">תנאים מסחריים</h3>
          <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {content.amount != null && (
              <DocField
                label="סכום"
                value={`${formatCurrencySymbol(content.currency)}${Number(content.amount).toLocaleString("he-IL")}`}
              />
            )}
            <DocField label="מטבע" value={content.currency} />
            <DocField label="תאריך התחלה" value={formatDateHe(content.startDate)} />
            <DocField label="תאריך סיום" value={formatDateHe(content.endDate)} />
            <DocField label="תאריך חידוש" value={formatDateHe(content.renewalDate)} />
            {content.cancellationNoticeDays != null && (
              <DocField label="ימי הודעה לביטול" value={String(content.cancellationNoticeDays)} />
            )}
            {content.paymentTerms && (
              <DocField label="תנאי תשלום" value={content.paymentTerms} />
            )}
          </div>
        </div>

        {/* Clauses */}
        {clauses.length > 0 && (
          <div className="border-b border-[#E2E8F0] px-6 py-5">
            <h3 className="text-sm font-bold text-[#2563EB] mb-4">סעיפי החוזה</h3>
            <div className="space-y-5">
              {clauses.map((clause, i) => (
                <div key={clause.id} className="rounded-xl border border-[#E2E8F0] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#DBEAFE] text-[10px] font-bold text-[#2563EB]">
                      {i + 1}
                    </span>
                    <span className="text-sm font-bold text-[#0F172A]">{clause.title}</span>
                    <Badge className="text-[10px] font-semibold rounded-lg bg-[#F1F5F9] text-[#64748B]">
                      {clause.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">
                    {clause.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Notes */}
        {content.customNotes && (
          <div className="px-6 py-5">
            <h3 className="text-sm font-bold text-[#2563EB] mb-3">הערות</h3>
            <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">
              {content.customNotes}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!content.company && !content.contact && clauses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-[#94A3B8] font-medium">
              אין תוכן מסמך לגרסה זו
            </p>
            <p className="text-xs text-[#CBD5E1] mt-1">
              צור גרסה חדשה כדי לבנות מסמך חוזה עם כל הפרטים
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function DocField({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  if (!value || value === "—") return null
  return (
    <div>
      <p className="text-[11px] text-[#94A3B8] font-medium">{label}</p>
      <p className="text-sm font-semibold text-[#0F172A]">{value}</p>
    </div>
  )
}
