"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, MessageSquare, FileText, PenTool } from "lucide-react"
import { signContract, clientRequestChanges } from "@/actions/client-portal"

interface PortalData {
  token: string
  status: string
  signerEmail: string
  signerName: string
  contract: {
    title: string
    contractType: string
    companyName: string | null
    contactName: string | null
    contactTitle: string | null
    amount: number | null
    currency: string
    startDate: string | null
    endDate: string | null
  }
  versionContent: {
    clauses: { id: string; title: string; category: string; content: string }[]
    paymentTerms: string | null
    customNotes: string | null
    company: { name: string; registrationNumber?: string | null; address?: string | null } | null
    contact: { fullName: string; email?: string | null; phone?: string | null; title?: string | null; isSignatory?: boolean } | null
  }
}

function formatDateHe(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleDateString("he-IL")
  } catch {
    return dateStr
  }
}

function formatCurrency(amount: number | null, currency: string): string {
  if (amount == null) return "—"
  const sym = currency === "ILS" ? "₪" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency
  return `${sym}${amount.toLocaleString("he-IL")}`
}

type PortalView = "review" | "signed" | "changes_sent"

export function ClientPortalForm({ data }: { data: PortalData }) {
  const [view, setView] = useState<PortalView>(
    data.status === "SIGNED" ? "signed" : "review"
  )
  const [readAgreement, setReadAgreement] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showChangesBox, setShowChangesBox] = useState(false)
  const [changeComment, setChangeComment] = useState("")
  const [signatureName, setSignatureName] = useState("")
  const [isPending, startTransition] = useTransition()

  const allChecked = readAgreement && isAuthorized && acceptTerms
  const canSign = allChecked && signatureName.trim().length > 0

  function handleSign() {
    if (!canSign) return
    startTransition(async () => {
      await signContract(data.token)
      setView("signed")
    })
  }

  function handleRequestChanges() {
    if (!changeComment.trim()) return
    startTransition(async () => {
      await clientRequestChanges({ token: data.token, comment: changeComment.trim() })
      setView("changes_sent")
    })
  }

  const { contract, versionContent } = data
  const clauses = versionContent.clauses

  if (view === "signed") {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
          <div className="rounded-2xl bg-white border border-[#E2E8F0] p-8 shadow-[0_4px_20px_rgba(15,23,42,0.04)] text-center space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#DCFCE7]">
              <CheckCircle className="size-8 text-[#16A34A]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F172A]">החוזה נחתם בהצלחה!</h1>
            <p className="text-sm text-[#64748B]">
              תודה {data.signerName}, החתימה שלך נקלטה במערכת.
            </p>
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-sm">
              <p className="font-semibold text-[#0F172A]">{contract.title}</p>
              <p className="text-xs text-[#94A3B8] mt-1">
                {contract.contractType} • {contract.companyName ?? ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (view === "changes_sent") {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
          <div className="rounded-2xl bg-white border border-[#E2E8F0] p-8 shadow-[0_4px_20px_rgba(15,23,42,0.04)] text-center space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#FEF3C7]">
              <MessageSquare className="size-8 text-[#D97706]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F172A]">בקשת השינויים נשלחה</h1>
            <p className="text-sm text-[#64748B]">
              ההערות שלך הועברו לצוות. נחזור אליך בהקדם.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#2563EB] text-white font-bold text-lg">
            H
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">פורטל חתימת לקוח</h1>
          <p className="text-sm text-[#64748B]">אנא עיין בחוזה, אשר את התנאים וחתום</p>
        </div>

        {/* Contract Summary */}
        <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">{contract.title}</h2>
              <p className="text-xs text-[#64748B] mt-0.5">{contract.contractType}</p>
            </div>
            <Badge className="text-xs font-bold rounded-lg bg-[#FEF3C7] text-[#D97706]">
              ממתין לחתימה
            </Badge>
          </div>

          <div className="p-6 space-y-5">
            {/* Parties */}
            <div>
              <h3 className="text-sm font-bold text-[#2563EB] mb-3">צדדים לחוזה</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {versionContent.company && (
                  <div className="rounded-xl border border-[#E2E8F0] p-4 space-y-1.5">
                    <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">חברה</p>
                    <p className="text-sm font-bold text-[#0F172A]">{versionContent.company.name}</p>
                    {versionContent.company.registrationNumber && (
                      <p className="text-xs text-[#64748B]">ח.פ. {versionContent.company.registrationNumber}</p>
                    )}
                    {versionContent.company.address && (
                      <p className="text-xs text-[#64748B]">{versionContent.company.address}</p>
                    )}
                  </div>
                )}
                <div className="rounded-xl border border-[#E2E8F0] p-4 space-y-1.5">
                  <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">חותם</p>
                  <p className="text-sm font-bold text-[#0F172A]">{data.signerName}</p>
                  <p className="text-xs text-[#64748B]">{data.signerEmail}</p>
                  {contract.contactTitle && (
                    <p className="text-xs text-[#64748B]">{contract.contactTitle}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Commercial Terms */}
            <div>
              <h3 className="text-sm font-bold text-[#2563EB] mb-3">תנאים מסחריים</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <TermRow label="סכום" value={formatCurrency(contract.amount, contract.currency)} />
                <TermRow label="מטבע" value={contract.currency} />
                <TermRow label="תאריך התחלה" value={formatDateHe(contract.startDate)} />
                <TermRow label="תאריך סיום" value={formatDateHe(contract.endDate)} />
                {versionContent.paymentTerms && (
                  <div className="sm:col-span-2">
                    <TermRow label="תנאי תשלום" value={versionContent.paymentTerms} />
                  </div>
                )}
              </div>
            </div>

            {/* Clauses */}
            {clauses.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-[#2563EB] mb-3">
                  <FileText className="size-4 inline ml-1.5" />
                  סעיפי החוזה
                </h3>
                <div className="space-y-3">
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
            {versionContent.customNotes && (
              <div>
                <h3 className="text-sm font-bold text-[#2563EB] mb-2">הערות</h3>
                <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">
                  {versionContent.customNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Checklist */}
        <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A]">אישור תנאים</h3>

          <ChecklistItem
            checked={readAgreement}
            onCheckedChange={(v) => setReadAgreement(v === true)}
            label="קראתי את ההסכם במלואו ואני מבין את תנאיו"
          />
          <ChecklistItem
            checked={isAuthorized}
            onCheckedChange={(v) => setIsAuthorized(v === true)}
            label="אני מורשה חתימה מטעם החברה"
          />
          <ChecklistItem
            checked={acceptTerms}
            onCheckedChange={(v) => setAcceptTerms(v === true)}
            label="אני מאשר את תנאי התשלום המפורטים בחוזה"
          />
        </div>

        {/* Request Changes */}
        <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-4">
          {!showChangesBox ? (
            <button
              onClick={() => setShowChangesBox(true)}
              className="flex items-center gap-2 text-sm font-semibold text-[#D97706] hover:text-[#B45309] transition-colors"
            >
              <MessageSquare className="size-4" />
              יש לי הערות / אני מבקש שינויים
            </button>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#0F172A]">בקשת שינויים</h3>
              <Textarea
                value={changeComment}
                onChange={(e) => setChangeComment(e.target.value)}
                placeholder="פרט את השינויים המבוקשים..."
                rows={4}
                className="rounded-xl border-[#E2E8F0]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleRequestChanges}
                  disabled={isPending || !changeComment.trim()}
                  variant="outline"
                  className="rounded-xl border-[#D97706] text-[#D97706] hover:bg-[#FEF3C7]"
                >
                  {isPending ? "שולח..." : "שלח בקשת שינויים"}
                </Button>
                <Button
                  onClick={() => { setShowChangesBox(false); setChangeComment("") }}
                  variant="outline"
                  className="rounded-xl text-[#64748B]"
                >
                  ביטול
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mock Signature */}
        <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <PenTool className="size-4 text-[#7C3AED]" />
            חתימה
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#64748B]">הקלד שמך המלא לאישור</label>
            <div className="relative">
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder={data.signerName}
                className="w-full rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-6 text-center text-2xl font-signature text-[#0F172A] focus:outline-none focus:border-[#7C3AED] transition-colors"
                style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}
                dir="rtl"
              />
            </div>
            {signatureName.trim() && (
              <p className="text-[11px] text-[#94A3B8] text-center">
                חתימה: {signatureName} • {data.signerEmail} • {new Date().toLocaleDateString("he-IL")}
              </p>
            )}
          </div>

          <Button
            onClick={handleSign}
            disabled={isPending || !canSign}
            className="w-full rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold py-3 gap-2"
            size="lg"
          >
            {isPending ? (
              "חותם..."
            ) : (
              <>
                <CheckCircle className="size-5" />
                חתום על החוזה
              </>
            )}
          </Button>

          {!allChecked && (
            <p className="text-xs text-[#DC2626] text-center font-medium">
              יש לאשר את כל התנאים לפני החתימה
            </p>
          )}

          <p className="text-center text-[10px] text-[#94A3B8] leading-relaxed">
            בלחיצה על &quot;חתום על החוזה&quot; אתה מאשר שקראת את החוזה ומסכים לתנאיו.
            החתימה תקינה משפטית בהתאם לחוק חתימה אלקטרונית, התשס&quot;א-2001.
          </p>
        </div>
      </div>
    </div>
  )
}

function TermRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#F8FAFC] px-4 py-2.5">
      <p className="text-[10px] text-[#94A3B8] font-medium">{label}</p>
      <p className="text-sm font-semibold text-[#0F172A]">{value}</p>
    </div>
  )
}

function ChecklistItem({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean
  onCheckedChange: (v: boolean | "indeterminate") => void
  label: string
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${
        checked
          ? "border-[#16A34A] bg-[#F0FDF4]"
          : "border-[#E2E8F0] hover:border-[#93C5FD]"
      }`}
      onClick={() => onCheckedChange(!checked)}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0"
      />
      <span className={`text-sm font-medium ${checked ? "text-[#16A34A]" : "text-[#0F172A]"}`}>
        {label}
      </span>
    </div>
  )
}
