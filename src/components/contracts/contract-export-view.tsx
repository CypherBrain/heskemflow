"use client"

import { useCallback, useRef, useState } from "react"
import { Printer, Download, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { VersionContentData } from "./contract-document-tab"

interface ExportData {
  contractId: string
  contractTitle: string
  contractStatus: string
  versionNumber: number
  versionCreatedAt: string
  content: VersionContentData
  signerName?: string | null
  signerEmail?: string | null
  signedAt?: string | null
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleDateString("he-IL")
  } catch {
    return dateStr
  }
}

function fmtCurrency(amount: number | null | undefined, currency?: string): string {
  if (amount == null) return "—"
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₪"
  return `${sym}${Number(amount).toLocaleString("he-IL")}`
}

function buildExportHtml(data: ExportData): string {
  const c = data.content
  const clauses = c.clauses ?? []
  const today = new Date().toLocaleDateString("he-IL")

  const clausesHtml = clauses.map((cl, i) => `
    <div class="clause">
      <h3>${i + 1}. ${cl.title} <span class="clause-cat">[${cl.category}]</span></h3>
      <p>${cl.content}</p>
    </div>
  `).join("")

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${data.contractTitle}</title>
<style>
  @page { size: A4; margin: 25mm 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Segoe UI", Tahoma, Arial, sans-serif;
    color: #0F172A; direction: rtl; line-height: 1.7;
    max-width: 210mm; margin: 0 auto; padding: 20mm 15mm;
    font-size: 13px;
  }
  .doc-header { text-align: center; border-bottom: 3px double #2563EB; padding-bottom: 16px; margin-bottom: 24px; }
  .doc-header h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .doc-header .meta { font-size: 11px; color: #64748B; }
  .section { margin-bottom: 24px; page-break-inside: avoid; }
  .section-title { font-size: 14px; font-weight: 700; color: #2563EB; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 10px; }
  .two-col { display: flex; gap: 32px; }
  .two-col .col { flex: 1; }
  .field { margin-bottom: 6px; }
  .field-label { font-size: 11px; color: #64748B; font-weight: 600; }
  .field-value { font-size: 13px; font-weight: 600; }
  .clause { margin-bottom: 16px; }
  .clause h3 { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
  .clause-cat { font-weight: 400; color: #64748B; font-size: 11px; }
  .clause p { white-space: pre-wrap; }
  .sig-grid { display: flex; gap: 32px; margin-top: 40px; }
  .sig-block { flex: 1; border-top: 2px solid #0F172A; padding-top: 8px; text-align: center; }
  .sig-block .sig-label { font-size: 11px; color: #64748B; margin-bottom: 4px; }
  .sig-block .sig-line { height: 48px; }
  .sig-block .sig-name { font-size: 12px; font-weight: 600; }
  .footer { margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 12px; font-size: 10px; color: #94A3B8; text-align: center; line-height: 1.6; }
  @media print {
    body { padding: 0; max-width: none; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
  <div class="doc-header">
    <h1>${data.contractTitle}</h1>
    <div class="meta">
      ${c.contractType ?? ""} &bull; גרסה ${data.versionNumber} &bull; ${fmtDate(data.versionCreatedAt)}
      ${c.industry ? ` &bull; ${c.industry}` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-title">צדדים לחוזה</div>
    <div class="two-col">
      <div class="col">
        ${c.company ? `
        <div class="field"><span class="field-label">חברה</span><br><span class="field-value">${c.company.name}</span></div>
        ${c.company.registrationNumber ? `<div class="field"><span class="field-label">ח.פ.</span><br><span class="field-value">${c.company.registrationNumber}</span></div>` : ""}
        ${c.company.address ? `<div class="field"><span class="field-label">כתובת</span><br><span class="field-value">${c.company.address}</span></div>` : ""}
        ` : '<div class="field"><span class="field-value">—</span></div>'}
      </div>
      <div class="col">
        ${c.contact ? `
        <div class="field"><span class="field-label">איש קשר / חותם</span><br><span class="field-value">${c.contact.fullName}</span></div>
        ${c.contact.title ? `<div class="field"><span class="field-label">תפקיד</span><br><span class="field-value">${c.contact.title}</span></div>` : ""}
        ${c.contact.email ? `<div class="field"><span class="field-label">אימייל</span><br><span class="field-value">${c.contact.email}</span></div>` : ""}
        ${c.contact.phone ? `<div class="field"><span class="field-label">טלפון</span><br><span class="field-value">${c.contact.phone}</span></div>` : ""}
        ` : '<div class="field"><span class="field-value">—</span></div>'}
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">תנאים מסחריים</div>
    <div class="two-col">
      <div class="col">
        ${c.amount != null ? `<div class="field"><span class="field-label">סכום</span><br><span class="field-value">${fmtCurrency(c.amount, c.currency)}</span></div>` : ""}
        <div class="field"><span class="field-label">מטבע</span><br><span class="field-value">${c.currency ?? "ILS"}</span></div>
        <div class="field"><span class="field-label">תאריך התחלה</span><br><span class="field-value">${fmtDate(c.startDate)}</span></div>
        <div class="field"><span class="field-label">תאריך סיום</span><br><span class="field-value">${fmtDate(c.endDate)}</span></div>
      </div>
      <div class="col">
        <div class="field"><span class="field-label">תאריך חידוש</span><br><span class="field-value">${fmtDate(c.renewalDate)}</span></div>
        ${c.cancellationNoticeDays != null ? `<div class="field"><span class="field-label">ימי הודעה לביטול</span><br><span class="field-value">${c.cancellationNoticeDays}</span></div>` : ""}
        ${c.paymentTerms ? `<div class="field"><span class="field-label">תנאי תשלום</span><br><span class="field-value">${c.paymentTerms}</span></div>` : ""}
      </div>
    </div>
  </div>

  ${clauses.length > 0 ? `
  <div class="section">
    <div class="section-title">סעיפי החוזה</div>
    ${clausesHtml}
  </div>
  ` : ""}

  ${c.customNotes ? `
  <div class="section">
    <div class="section-title">הערות</div>
    <p style="white-space:pre-wrap;">${c.customNotes}</p>
  </div>
  ` : ""}

  <div class="section">
    <div class="section-title">חתימות</div>
    <div class="sig-grid">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">חתימת החברה</div>
        <div class="sig-name">${c.company?.name ?? "—"}</div>
        <div class="sig-label">תאריך: _______________</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">חתימת הלקוח / מורשה חתימה</div>
        <div class="sig-name">${data.signerName ?? c.contact?.fullName ?? "—"}</div>
        <div class="sig-label">תאריך: ${data.signedAt ? fmtDate(data.signedAt) : "_______________"}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    מסמך זה הופק ממערכת HeskemFlow &bull; מזהה חוזה: ${data.contractId} &bull; גרסה ${data.versionNumber} &bull; הופק בתאריך: ${today}
    <br>
    סטטוס: ${data.contractStatus} &bull; מסמך זה אינו מהווה ייעוץ משפטי ואין להסתמך עליו ללא חתימות מורשות.
  </div>
</body>
</html>`
}

export function ContractExportView(props: ExportData) {
  const { content, versionNumber, versionCreatedAt, contractTitle } = props
  const printFrameRef = useRef<HTMLIFrameElement>(null)
  const [copied, setCopied] = useState(false)
  const clauses = content.clauses ?? []

  const handlePrint = useCallback(() => {
    const html = buildExportHtml(props)
    const iframe = printFrameRef.current
    if (!iframe) return
    const doc = iframe.contentDocument
    if (!doc) return
    doc.open()
    doc.write(html)
    doc.close()
    setTimeout(() => iframe.contentWindow?.print(), 300)
  }, [props])

  const handleDownloadHtml = useCallback(() => {
    const html = buildExportHtml(props)
    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${contractTitle.replace(/\s+/g, "_")}_v${versionNumber}.html`
    a.click()
    URL.revokeObjectURL(url)
  }, [props, contractTitle, versionNumber])

  const handleCopyText = useCallback(() => {
    const el = document.getElementById("export-preview")
    if (!el) return
    const text = el.innerText
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handlePrint} size="sm" className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white gap-1.5 text-xs">
          <Printer className="size-3.5" />
          הדפסה / PDF
        </Button>
        <Button onClick={handleDownloadHtml} variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
          <Download className="size-3.5" />
          הורדת HTML
        </Button>
        <Button onClick={handleCopyText} variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
          {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
          {copied ? "הועתק!" : "העתק טקסט"}
        </Button>
      </div>

      <p className="text-[11px] text-[#94A3B8]">
        לחץ &quot;הדפסה / PDF&quot; כדי להדפיס או לשמור כ-PDF דרך הדפדפן. שירות PDF ייעודי יתווסף בגרסה עתידית.
      </p>

      {/* Hidden iframe for printing */}
      <iframe ref={printFrameRef} className="hidden" title="print-frame" />

      {/* Preview */}
      <div
        id="export-preview"
        className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <div className="px-8 py-6" style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* Header */}
          <div className="text-center border-b-4 border-double border-[#2563EB] pb-4 mb-6">
            <h1 className="text-xl font-extrabold text-[#0F172A]">{content.title ?? contractTitle}</h1>
            <p className="text-xs text-[#64748B] mt-1">
              {content.contractType} &bull; גרסה {versionNumber} &bull; {fmtDate(versionCreatedAt)}
              {content.industry ? ` \u2022 ${content.industry}` : ""}
            </p>
          </div>

          {/* Parties */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[#2563EB] border-b border-[#E2E8F0] pb-1 mb-3">צדדים לחוזה</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {content.company && (
                <div className="space-y-1">
                  <ExportField label="חברה" value={content.company.name} />
                  <ExportField label="ח.פ." value={content.company.registrationNumber} />
                  <ExportField label="כתובת" value={content.company.address} />
                </div>
              )}
              {content.contact && (
                <div className="space-y-1">
                  <ExportField label="איש קשר / חותם" value={content.contact.fullName} />
                  <ExportField label="תפקיד" value={content.contact.title} />
                  <ExportField label="אימייל" value={content.contact.email} />
                  <ExportField label="טלפון" value={content.contact.phone} />
                </div>
              )}
            </div>
          </div>

          {/* Commercial Terms */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[#2563EB] border-b border-[#E2E8F0] pb-1 mb-3">תנאים מסחריים</h2>
            <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {content.amount != null && <ExportField label="סכום" value={fmtCurrency(content.amount, content.currency)} />}
              <ExportField label="מטבע" value={content.currency} />
              <ExportField label="תאריך התחלה" value={fmtDate(content.startDate)} />
              <ExportField label="תאריך סיום" value={fmtDate(content.endDate)} />
              <ExportField label="תאריך חידוש" value={fmtDate(content.renewalDate)} />
              {content.cancellationNoticeDays != null && (
                <ExportField label="ימי הודעה לביטול" value={String(content.cancellationNoticeDays)} />
              )}
              {content.paymentTerms && <ExportField label="תנאי תשלום" value={content.paymentTerms} />}
            </div>
          </div>

          {/* Clauses */}
          {clauses.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-[#2563EB] border-b border-[#E2E8F0] pb-1 mb-3">סעיפי החוזה</h2>
              <div className="space-y-4">
                {clauses.map((cl, i) => (
                  <div key={cl.id}>
                    <p className="text-[13px] font-bold text-[#0F172A]">
                      {i + 1}. {cl.title}{" "}
                      <span className="text-[11px] font-normal text-[#64748B]">[{cl.category}]</span>
                    </p>
                    <p className="text-[13px] text-[#334155] leading-relaxed whitespace-pre-wrap mt-1">
                      {cl.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Notes */}
          {content.customNotes && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-[#2563EB] border-b border-[#E2E8F0] pb-1 mb-3">הערות</h2>
              <p className="text-[13px] text-[#334155] leading-relaxed whitespace-pre-wrap">
                {content.customNotes}
              </p>
            </div>
          )}

          {/* Signature Blocks */}
          <div className="mb-8 mt-10">
            <h2 className="text-sm font-bold text-[#2563EB] border-b border-[#E2E8F0] pb-1 mb-6">חתימות</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="border-t-2 border-[#0F172A] pt-3 text-center space-y-1">
                <div className="h-12" />
                <p className="text-[11px] text-[#64748B]">חתימת החברה</p>
                <p className="text-xs font-semibold text-[#0F172A]">{content.company?.name ?? "—"}</p>
                <p className="text-[11px] text-[#64748B]">תאריך: _______________</p>
              </div>
              <div className="border-t-2 border-[#0F172A] pt-3 text-center space-y-1">
                <div className="h-12" />
                <p className="text-[11px] text-[#64748B]">חתימת הלקוח / מורשה חתימה</p>
                <p className="text-xs font-semibold text-[#0F172A]">
                  {props.signerName ?? content.contact?.fullName ?? "—"}
                </p>
                <p className="text-[11px] text-[#64748B]">
                  תאריך: {props.signedAt ? fmtDate(props.signedAt) : "_______________"}
                </p>
              </div>
            </div>
          </div>

          {/* Audit Footer */}
          <div className="border-t border-[#E2E8F0] pt-3 text-center text-[10px] text-[#94A3B8] leading-relaxed">
            מסמך זה הופק ממערכת HeskemFlow &bull; מזהה חוזה: {props.contractId} &bull; גרסה {versionNumber} &bull; הופק בתאריך: {new Date().toLocaleDateString("he-IL")}
            <br />
            סטטוס: {props.contractStatus} &bull; מסמך זה אינו מהווה ייעוץ משפטי ואין להסתמך עליו ללא חתימות מורשות.
          </div>
        </div>
      </div>
    </div>
  )
}

function ExportField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <span className="text-[10px] text-[#94A3B8] font-semibold">{label}</span>
      <p className="text-[13px] font-semibold text-[#0F172A]">{value}</p>
    </div>
  )
}
