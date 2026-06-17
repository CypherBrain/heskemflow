"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { createContractFull, getFormLookupData } from "@/actions/contracts"
import type { ContractStatus } from "@prisma/client"

const contractTypes = [
  { value: "Service Agreement", label: "הסכם שירותים", icon: "⚙️" },
  { value: "NDA", label: "הסכם סודיות", icon: "🔒" },
  { value: "Employment", label: "חוזה העסקה", icon: "👤" },
  { value: "Sales", label: "הסכם מכירות", icon: "💰" },
  { value: "License", label: "הסכם רישיון", icon: "📋" },
  { value: "Partnership", label: "הסכם שותפות", icon: "🤝" },
  { value: "Consulting", label: "הסכם ייעוץ", icon: "💡" },
  { value: "Lease", label: "הסכם השכרה", icon: "🏢" },
]

const statusOptions: { value: ContractStatus; label: string }[] = [
  { value: "DRAFT", label: "טיוטה" },
  { value: "INTERNAL_REVIEW", label: "בדיקה פנימית" },
  { value: "ACTIVE", label: "פעיל" },
]

const steps = [
  { id: 1, title: "סוג חוזה" },
  { id: 2, title: "צדדים" },
  { id: 3, title: "פרטים" },
  { id: 4, title: "סעיפים" },
  { id: 5, title: "סקירה" },
]

const riskLabels: Record<string, string> = {
  high: "גבוה",
  medium: "בינוני",
  low: "נמוך",
}

const riskColors: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-green-50 text-green-700 border-green-200",
}

interface LookupData {
  companies: { id: string; name: string }[]
  contacts: { id: string; fullName: string; companyId: string | null }[]
  deals: { id: string; title: string; companyId: string | null }[]
  templates: { id: string; name: string; contractType: string }[]
  users: { id: string; fullName: string; role: string }[]
  clauses: { id: string; title: string; category: string; riskLevel: string; content: string }[]
}

export default function NewContractPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [lookup, setLookup] = useState<LookupData | null>(null)

  const [data, setData] = useState({
    contractType: "",
    title: "",
    companyId: "",
    contactId: "",
    dealId: "",
    templateId: "",
    industry: "",
    status: "DRAFT" as ContractStatus,
    amount: "",
    currency: "ILS",
    startDate: "",
    endDate: "",
    renewalDate: "",
    cancellationNoticeDays: "",
    internalOwnerId: "",
    selectedClauseIds: [] as string[],
    paymentTerms: "",
    customNotes: "",
  })

  useEffect(() => {
    getFormLookupData().then(setLookup)
  }, [])

  function next() {
    if (step < steps.length) setStep(step + 1)
  }
  function prev() {
    if (step > 1) setStep(step - 1)
  }

  const filteredContacts = lookup?.contacts.filter(
    (c) => !data.companyId || c.companyId === data.companyId
  ) ?? []

  const filteredDeals = lookup?.deals.filter(
    (d) => !data.companyId || d.companyId === data.companyId
  ) ?? []

  const filteredTemplates = lookup?.templates.filter(
    (t) => !data.contractType || t.contractType === data.contractType
  ) ?? []

  function toggleClause(clauseId: string) {
    setData((prev) => ({
      ...prev,
      selectedClauseIds: prev.selectedClauseIds.includes(clauseId)
        ? prev.selectedClauseIds.filter((id) => id !== clauseId)
        : [...prev.selectedClauseIds, clauseId],
    }))
  }

  function handleCreate() {
    if (!data.title || !data.contractType || !data.companyId || !data.contactId) {
      setError("יש למלא כותרת, סוג חוזה, חברה ואיש קשר")
      return
    }
    setError("")

    startTransition(async () => {
      try {
        const result = await createContractFull({
          title: data.title,
          contractType: data.contractType,
          companyId: data.companyId,
          contactId: data.contactId,
          dealId: data.dealId || undefined,
          templateId: data.templateId || undefined,
          industry: data.industry,
          status: data.status,
          amount: data.amount ? parseFloat(data.amount) : undefined,
          currency: data.currency,
          startDate: data.startDate,
          endDate: data.endDate || undefined,
          renewalDate: data.renewalDate || undefined,
          cancellationNoticeDays: data.cancellationNoticeDays
            ? parseInt(data.cancellationNoticeDays)
            : undefined,
          internalOwnerId: data.internalOwnerId,
          selectedClauseIds: data.selectedClauseIds.length > 0 ? data.selectedClauseIds : undefined,
          paymentTerms: data.paymentTerms || undefined,
          customNotes: data.customNotes || undefined,
        })
        router.push(`/contracts/${result.id}`)
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה ביצירת החוזה")
      }
    })
  }

  const selectedClauseObjects = lookup?.clauses.filter((c) =>
    data.selectedClauseIds.includes(c.id)
  ) ?? []

  const selectClass = "w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-shadow"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F172A]">יצירת חוזה חדש</h1>
        <p className="text-sm text-[#94A3B8] mt-1">מלא את הפרטים ליצירת חוזה חדש</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Vertical Stepper – left side */}
        <div className="hidden md:block w-56 shrink-0">
          <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sticky top-24">
            <nav className="space-y-1">
              {steps.map((s, idx) => {
                const isCompleted = step > s.id
                const isActive = step === s.id
                return (
                  <div key={s.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isCompleted
                            ? "bg-[#16A34A] text-white"
                            : isActive
                              ? "bg-[#2563EB] text-white shadow-[0_0_0_4px_rgba(37,99,235,0.15)]"
                              : "border-2 border-[#E2E8F0] text-[#94A3B8]"
                        }`}
                      >
                        {isCompleted ? <Check className="size-4" /> : s.id}
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`w-px h-8 mt-1 ${isCompleted ? "bg-[#16A34A]" : "bg-[#E2E8F0]"}`} />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className={`text-sm font-semibold leading-tight ${isActive ? "text-[#2563EB]" : isCompleted ? "text-[#16A34A]" : "text-[#94A3B8]"}`}>
                        {s.title}
                      </p>
                    </div>
                  </div>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Mobile step indicator */}
        <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-1">
          {steps.map((s) => {
            const isCompleted = step > s.id
            const isActive = step === s.id
            return (
              <div
                key={s.id}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#2563EB] text-white"
                    : isCompleted
                      ? "bg-[#DCFCE7] text-[#16A34A]"
                      : "bg-[#F1F5F9] text-[#94A3B8]"
                }`}
              >
                {isCompleted ? <Check className="size-3" /> : <span>{s.id}</span>}
                <span>{s.title}</span>
              </div>
            )
          })}
        </div>

        {/* Form content */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="border-b border-[#E2E8F0] px-6 py-4">
              <h2 className="text-base font-bold text-[#0F172A]">
                שלב {step} מתוך {steps.length}: {steps[step - 1].title}
              </h2>
              <div className="mt-3 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#2563EB] transition-all duration-500 ease-out"
                  style={{ width: `${(step / steps.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-6">
              {/* Step 1: Contract Type */}
              {step === 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {contractTypes.map((ct) => (
                    <div
                      key={ct.value}
                      className={`group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                        data.contractType === ct.value
                          ? "border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_0_4px_rgba(37,99,235,0.08)]"
                          : "border-[#E2E8F0] hover:border-[#93C5FD] hover:bg-[#F8FAFC]"
                      }`}
                      onClick={() => setData({ ...data, contractType: ct.value })}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{ct.icon}</span>
                        <span className={`font-semibold text-sm ${data.contractType === ct.value ? "text-[#2563EB]" : "text-[#0F172A]"}`}>
                          {ct.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 2: Parties */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#0F172A]">חברה *</label>
                    <select
                      className={selectClass}
                      value={data.companyId}
                      onChange={(e) => setData({ ...data, companyId: e.target.value, contactId: "", dealId: "" })}
                    >
                      <option value="">בחר חברה...</option>
                      {lookup?.companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#0F172A]">איש קשר *</label>
                    <select
                      className={selectClass}
                      value={data.contactId}
                      onChange={(e) => setData({ ...data, contactId: e.target.value })}
                    >
                      <option value="">בחר איש קשר...</option>
                      {filteredContacts.map((c) => (
                        <option key={c.id} value={c.id}>{c.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#0F172A]">עסקה</label>
                    <select
                      className={selectClass}
                      value={data.dealId}
                      onChange={(e) => setData({ ...data, dealId: e.target.value })}
                    >
                      <option value="">ללא עסקה מקושרת</option>
                      {filteredDeals.map((d) => (
                        <option key={d.id} value={d.id}>{d.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#0F172A]">תבנית</label>
                    <select
                      className={selectClass}
                      value={data.templateId}
                      onChange={(e) => setData({ ...data, templateId: e.target.value })}
                    >
                      <option value="">ללא תבנית</option>
                      {filteredTemplates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#0F172A]">אחראי פנימי *</label>
                    <select
                      className={selectClass}
                      value={data.internalOwnerId}
                      onChange={(e) => setData({ ...data, internalOwnerId: e.target.value })}
                    >
                      <option value="">בחר אחראי...</option>
                      {lookup?.users.map((u) => (
                        <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Details */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#0F172A]">כותרת החוזה *</label>
                    <Input
                      className="rounded-xl border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                      value={data.title}
                      onChange={(e) => setData({ ...data, title: e.target.value })}
                      placeholder="הכנס כותרת..."
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#0F172A]">תעשייה</label>
                      <Input
                        className="rounded-xl border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                        value={data.industry}
                        onChange={(e) => setData({ ...data, industry: e.target.value })}
                        placeholder="לדוגמה: SaaS / Technology"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#0F172A]">סטטוס</label>
                      <select
                        className={selectClass}
                        value={data.status}
                        onChange={(e) => setData({ ...data, status: e.target.value as ContractStatus })}
                      >
                        {statusOptions.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#0F172A]">שווי</label>
                      <Input
                        className="rounded-xl border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                        type="number"
                        value={data.amount}
                        onChange={(e) => setData({ ...data, amount: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#0F172A]">מטבע</label>
                      <select
                        className={selectClass}
                        value={data.currency}
                        onChange={(e) => setData({ ...data, currency: e.target.value })}
                      >
                        <option value="ILS">₪ ILS</option>
                        <option value="USD">$ USD</option>
                        <option value="EUR">€ EUR</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#0F172A]">תאריך התחלה *</label>
                      <Input
                        className="rounded-xl border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                        type="date"
                        value={data.startDate}
                        onChange={(e) => setData({ ...data, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#0F172A]">תאריך סיום</label>
                      <Input
                        className="rounded-xl border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                        type="date"
                        value={data.endDate}
                        onChange={(e) => setData({ ...data, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#0F172A]">תאריך חידוש</label>
                      <Input
                        className="rounded-xl border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                        type="date"
                        value={data.renewalDate}
                        onChange={(e) => setData({ ...data, renewalDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#0F172A]">ימי הודעה לביטול</label>
                      <Input
                        className="rounded-xl border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                        type="number"
                        value={data.cancellationNoticeDays}
                        onChange={(e) => setData({ ...data, cancellationNoticeDays: e.target.value })}
                        placeholder="60"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#0F172A]">תנאי תשלום</label>
                    <Textarea
                      className="rounded-xl border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                      value={data.paymentTerms}
                      onChange={(e) => setData({ ...data, paymentTerms: e.target.value })}
                      placeholder="לדוגמה: שוטף + 30, תשלום חודשי..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#0F172A]">הערות נוספות</label>
                    <Textarea
                      className="rounded-xl border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                      value={data.customNotes}
                      onChange={(e) => setData({ ...data, customNotes: e.target.value })}
                      placeholder="הערות חופשיות שיופיעו במסמך החוזה..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Clause Selection */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#64748B]">
                      בחר סעיפים מהספרייה לשילוב בחוזה
                    </p>
                    <Badge className="text-xs font-bold rounded-lg bg-[#DBEAFE] text-[#2563EB]">
                      {data.selectedClauseIds.length} נבחרו
                    </Badge>
                  </div>
                  {!lookup?.clauses.length ? (
                    <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-[#E2E8F0]">
                      <p className="text-sm text-[#94A3B8] font-medium">
                        אין סעיפים בספרייה. ניתן להוסיף סעיפים בעמוד ספריית הסעיפים.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pe-1">
                      {lookup.clauses.map((clause) => {
                        const isSelected = data.selectedClauseIds.includes(clause.id)
                        return (
                          <div
                            key={clause.id}
                            className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? "border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_0_4px_rgba(37,99,235,0.08)]"
                                : "border-[#E2E8F0] hover:border-[#93C5FD] hover:bg-[#F8FAFC]"
                            }`}
                            onClick={() => toggleClause(clause.id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleClause(clause.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-[#0F172A]">{clause.title}</span>
                                <Badge className="text-[10px] font-semibold rounded-lg bg-[#F1F5F9] text-[#64748B]">
                                  {clause.category}
                                </Badge>
                                <Badge
                                  className={`text-[10px] font-semibold rounded-lg ${riskColors[clause.riskLevel] ?? "bg-[#F1F5F9] text-[#64748B]"}`}
                                >
                                  {riskLabels[clause.riskLevel] ?? clause.riskLevel}
                                </Badge>
                              </div>
                              <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                                {clause.content}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Review */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] divide-y divide-[#E2E8F0]">
                    <ReviewRow label="סוג" value={contractTypes.find((t) => t.value === data.contractType)?.label ?? "—"} />
                    <ReviewRow label="כותרת" value={data.title || "—"} />
                    <ReviewRow label="חברה" value={lookup?.companies.find((c) => c.id === data.companyId)?.name ?? "—"} />
                    <ReviewRow label="איש קשר" value={lookup?.contacts.find((c) => c.id === data.contactId)?.fullName ?? "—"} />
                    <ReviewRow label="עסקה" value={lookup?.deals.find((d) => d.id === data.dealId)?.title ?? "—"} />
                    <ReviewRow label="תבנית" value={lookup?.templates.find((t) => t.id === data.templateId)?.name ?? "—"} />
                    <ReviewRow label="תעשייה" value={data.industry || "—"} />
                    <ReviewRow label="סטטוס" value={statusOptions.find((s) => s.value === data.status)?.label ?? "—"} />
                    <ReviewRow label="שווי" value={data.amount ? `₪${Number(data.amount).toLocaleString("he-IL")}` : "—"} />
                    <ReviewRow label="מטבע" value={data.currency} />
                    <ReviewRow label="תאריך התחלה" value={data.startDate || "—"} />
                    <ReviewRow label="תאריך סיום" value={data.endDate || "—"} />
                    <ReviewRow label="תאריך חידוש" value={data.renewalDate || "—"} />
                    <ReviewRow label="ימי הודעה לביטול" value={data.cancellationNoticeDays || "—"} />
                    <ReviewRow label="תנאי תשלום" value={data.paymentTerms || "—"} />
                    <ReviewRow label="הערות נוספות" value={data.customNotes || "—"} />
                    <ReviewRow label="אחראי" value={lookup?.users.find((u) => u.id === data.internalOwnerId)?.fullName ?? "—"} />
                  </div>

                  {selectedClauseObjects.length > 0 && (
                    <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4">
                      <p className="text-sm font-bold text-[#0F172A] mb-3">
                        סעיפים נבחרים ({selectedClauseObjects.length})
                      </p>
                      <div className="space-y-2">
                        {selectedClauseObjects.map((c) => (
                          <div key={c.id} className="flex items-center gap-2 text-sm">
                            <div className="size-1.5 rounded-full bg-[#2563EB]" />
                            <span className="font-medium text-[#0F172A]">{c.title}</span>
                            <Badge className="text-[9px] font-semibold rounded-lg bg-[#F1F5F9] text-[#64748B]">
                              {c.category}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-[#E2E8F0] px-6 py-4">
              <Button
                variant="outline"
                onClick={prev}
                disabled={step === 1}
                className="rounded-xl border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
              >
                הקודם
              </Button>
              {step < steps.length ? (
                <Button
                  onClick={next}
                  disabled={step === 1 && !data.contractType}
                  className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm"
                >
                  הבא
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={isPending}
                  className="rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white shadow-sm"
                >
                  {isPending ? "יוצר..." : "צור חוזה"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-[#94A3B8] font-medium">{label}</span>
      <span className="text-sm font-semibold text-[#0F172A]">{value}</span>
    </div>
  )
}
