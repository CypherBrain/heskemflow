"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { createContractFull } from "@/actions/contracts"
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
  { value: "LEGAL_REVIEW", label: "בדיקה משפטית" },
  { value: "APPROVED", label: "מאושר" },
]

const steps = [
  { id: 1, title: "סוג חוזה" },
  { id: 2, title: "צדדים" },
  { id: 3, title: "פרטים" },
  { id: 4, title: "סקירה" },
]

interface LookupData {
  companies: { id: string; name: string }[]
  contacts: { id: string; fullName: string; companyId: string | null }[]
  deals: { id: string; title: string; companyId: string | null }[]
  templates: { id: string; name: string; contractType: string }[]
  users: { id: string; fullName: string; role: string }[]
}

interface FormData {
  contractType: string
  title: string
  companyId: string
  contactId: string
  dealId: string
  templateId: string
  internalOwnerId: string
  industry: string
  status: ContractStatus
  amount: string
  currency: string
  startDate: string
  endDate: string
  renewalDate: string
  cancellationNoticeDays: string
}

export function NewContractForm({ lookup }: { lookup: LookupData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [data, setData] = useState<FormData>({
    contractType: "",
    title: "",
    companyId: "",
    contactId: "",
    dealId: "",
    templateId: "",
    internalOwnerId: lookup.users[0]?.id ?? "",
    industry: "",
    status: "DRAFT",
    amount: "",
    currency: "ILS",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    renewalDate: "",
    cancellationNoticeDays: "60",
  })

  const progress = (step / steps.length) * 100

  const filteredContacts = data.companyId
    ? lookup.contacts.filter((c) => c.companyId === data.companyId)
    : lookup.contacts

  const filteredDeals = data.companyId
    ? lookup.deals.filter((d) => d.companyId === data.companyId)
    : lookup.deals

  const filteredTemplates = data.contractType
    ? lookup.templates.filter((t) => t.contractType === data.contractType)
    : lookup.templates

  function next() {
    if (step < steps.length) setStep(step + 1)
  }
  function prev() {
    if (step > 1) setStep(step - 1)
  }

  function canAdvance() {
    if (step === 1) return !!data.contractType
    if (step === 2) return !!data.companyId && !!data.contactId
    if (step === 3) return !!data.title && !!data.startDate
    return true
  }

  function handleCreate() {
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
        })
        router.push(`/contracts/${result.id}`)
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה ביצירת החוזה")
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">יצירת חוזה חדש</h1>
        <p className="text-muted-foreground">מלא את הפרטים ליצירת חוזה חדש</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            שלב {step} מתוך {steps.length}: {steps[step - 1].title}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {contractTypes.map((ct) => (
            <Card
              key={ct.value}
              className={`cursor-pointer transition-colors hover:border-primary ${
                data.contractType === ct.value ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => setData({ ...data, contractType: ct.value })}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-2xl">{ct.icon}</span>
                <span className="font-medium">{ct.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">צדדים לחוזה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SelectField
              label="חברה *"
              value={data.companyId}
              onChange={(v) => setData({ ...data, companyId: v, contactId: "", dealId: "" })}
              options={lookup.companies.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="בחר חברה"
            />
            <SelectField
              label="איש קשר *"
              value={data.contactId}
              onChange={(v) => setData({ ...data, contactId: v })}
              options={filteredContacts.map((c) => ({ value: c.id, label: c.fullName }))}
              placeholder="בחר איש קשר"
            />
            <SelectField
              label="עסקה (אופציונלי)"
              value={data.dealId}
              onChange={(v) => setData({ ...data, dealId: v })}
              options={filteredDeals.map((d) => ({ value: d.id, label: d.title }))}
              placeholder="בחר עסקה"
            />
            <SelectField
              label="תבנית (אופציונלי)"
              value={data.templateId}
              onChange={(v) => setData({ ...data, templateId: v })}
              options={filteredTemplates.map((t) => ({ value: t.id, label: t.name }))}
              placeholder="בחר תבנית"
            />
            <SelectField
              label="אחראי פנימי *"
              value={data.internalOwnerId}
              onChange={(v) => setData({ ...data, internalOwnerId: v })}
              options={lookup.users.map((u) => ({ value: u.id, label: u.fullName }))}
              placeholder="בחר אחראי"
            />
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">פרטי החוזה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">כותרת החוזה *</label>
              <Input
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                placeholder="הכנס כותרת..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">תעשייה</label>
                <Input
                  value={data.industry}
                  onChange={(e) => setData({ ...data, industry: e.target.value })}
                  placeholder="לדוגמה: SaaS / Technology"
                />
              </div>
              <SelectField
                label="סטטוס"
                value={data.status}
                onChange={(v) => setData({ ...data, status: v as ContractStatus })}
                options={statusOptions.map((s) => ({ value: s.value, label: s.label }))}
                placeholder="בחר סטטוס"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">שווי</label>
                <Input
                  type="number"
                  value={data.amount}
                  onChange={(e) => setData({ ...data, amount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">מטבע</label>
                <Input
                  value={data.currency}
                  onChange={(e) => setData({ ...data, currency: e.target.value })}
                  placeholder="ILS"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">תאריך התחלה *</label>
                <Input
                  type="date"
                  value={data.startDate}
                  onChange={(e) => setData({ ...data, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">תאריך סיום</label>
                <Input
                  type="date"
                  value={data.endDate}
                  onChange={(e) => setData({ ...data, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">תאריך חידוש</label>
                <Input
                  type="date"
                  value={data.renewalDate}
                  onChange={(e) => setData({ ...data, renewalDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ימי הודעה מוקדמת לביטול</label>
                <Input
                  type="number"
                  value={data.cancellationNoticeDays}
                  onChange={(e) => setData({ ...data, cancellationNoticeDays: e.target.value })}
                  placeholder="60"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">סקירה לפני יצירה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ReviewRow
              label="סוג חוזה"
              value={contractTypes.find((t) => t.value === data.contractType)?.label ?? "—"}
            />
            <ReviewRow label="כותרת" value={data.title || "—"} />
            <ReviewRow
              label="חברה"
              value={lookup.companies.find((c) => c.id === data.companyId)?.name ?? "—"}
            />
            <ReviewRow
              label="איש קשר"
              value={lookup.contacts.find((c) => c.id === data.contactId)?.fullName ?? "—"}
            />
            <ReviewRow
              label="עסקה"
              value={lookup.deals.find((d) => d.id === data.dealId)?.title ?? "—"}
            />
            <ReviewRow
              label="תבנית"
              value={lookup.templates.find((t) => t.id === data.templateId)?.name ?? "—"}
            />
            <ReviewRow
              label="אחראי"
              value={lookup.users.find((u) => u.id === data.internalOwnerId)?.fullName ?? "—"}
            />
            <ReviewRow label="תעשייה" value={data.industry || "—"} />
            <ReviewRow
              label="סטטוס"
              value={statusOptions.find((s) => s.value === data.status)?.label ?? "—"}
            />
            <ReviewRow
              label="שווי"
              value={data.amount ? `₪${Number(data.amount).toLocaleString("he-IL")}` : "—"}
            />
            <ReviewRow label="תאריך התחלה" value={data.startDate || "—"} />
            <ReviewRow label="תאריך סיום" value={data.endDate || "—"} />
            <ReviewRow label="תאריך חידוש" value={data.renewalDate || "—"} />
            <ReviewRow
              label="ימי הודעה מוקדמת"
              value={data.cancellationNoticeDays || "—"}
            />
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={prev} disabled={step === 1 || isPending}>
          הקודם
        </Button>
        {step < steps.length ? (
          <Button onClick={next} disabled={!canAdvance()}>
            הבא
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? "שומר..." : "צור חוזה"}
          </Button>
        )}
      </div>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
