import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { serializePrisma } from "@/lib/serialize"
import { CrmTabs } from "@/components/crm/crm-tabs"
import { Building2, Users, TrendingUp, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

type IntegrationStatus = "connected" | "disconnected" | "coming_soon"

type Integration = {
  name: string
  letter: string
  color: string
  description: string
  status: IntegrationStatus
}

const integrations: Integration[] = [
  {
    name: "Zoho CRM",
    letter: "Z",
    color: "bg-red-500",
    description: "סנכרון אנשי קשר, חברות ועסקאות מ-Zoho",
    status: "coming_soon",
  },
  {
    name: "HubSpot",
    letter: "H",
    color: "bg-orange-500",
    description: "ייבוא לידים ועסקאות ישירות מ-HubSpot",
    status: "disconnected",
  },
  {
    name: "Monday.com",
    letter: "M",
    color: "bg-[#FF3D57]",
    description: "חיבור לוחות Monday ליצירת חוזים אוטומטית",
    status: "disconnected",
  },
  {
    name: "Salesforce",
    letter: "S",
    color: "bg-[#00A1E0]",
    description: "סנכרון דו-כיווני של חוזים ועסקאות",
    status: "coming_soon",
  },
  {
    name: "Google Drive",
    letter: "G",
    color: "bg-[#34A853]",
    description: "שמירה אוטומטית של חוזים חתומים ב-Drive",
    status: "disconnected",
  },
  {
    name: "SignFlow",
    letter: "S",
    color: "bg-[#7C3AED]",
    description: "חתימה אלקטרונית מובנית עם תמיכה בעברית",
    status: "coming_soon",
  },
  {
    name: "DocuSign",
    letter: "D",
    color: "bg-[#FFD100] text-[#0F172A]",
    description: "חתימה דיגיטלית מתקדמת עם תמיכה בינלאומית",
    status: "disconnected",
  },
]

function StatusBadge({ status }: { status: IntegrationStatus }) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        מחובר
      </span>
    )
  }
  if (status === "coming_soon") {
    return (
      <span className="inline-flex items-center rounded-full bg-[#EDE9FE] px-2.5 py-0.5 text-[11px] font-semibold text-[#7C3AED]">
        בקרוב
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-[#64748B]">
      לא מחובר
    </span>
  )
}

export default async function CrmPage() {
  const { organizationId } = await getCurrentUser()
  const [rawCompanies, rawContacts, rawDeals] = await Promise.all([
    prisma.company.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contact.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { company: true },
    }),
    prisma.deal.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { company: true, contact: true },
    }),
  ])

  const companies = serializePrisma(rawCompanies) as unknown as Parameters<typeof CrmTabs>[0]["companies"]
  const contacts = serializePrisma(rawContacts) as unknown as Parameters<typeof CrmTabs>[0]["contacts"]
  const deals = serializePrisma(rawDeals) as unknown as Parameters<typeof CrmTabs>[0]["deals"]

  const statCards = [
    {
      icon: Building2,
      value: companies.length,
      label: "חברות",
      iconBg: "bg-[#DBEAFE]",
      iconColor: "text-[#2563EB]",
    },
    {
      icon: Users,
      value: contacts.length,
      label: "אנשי קשר",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: TrendingUp,
      value: deals.length,
      label: "עסקאות",
      iconBg: "bg-[#EDE9FE]",
      iconColor: "text-[#7C3AED]",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">CRM — מרכז אינטגרציות</h1>
        <p className="page-description mt-1">
          ניהול חברות, אנשי קשר ועסקאות — וחיבור לכלי CRM חיצוניים
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
          >
            <div className={`flex size-11 items-center justify-center rounded-xl ${card.iconBg}`}>
              <card.icon className={`size-5 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F172A]">{card.value}</p>
              <p className="text-xs font-medium text-[#64748B]">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <CrmTabs companies={companies} contacts={contacts} deals={deals} />

      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">אינטגרציות חיצוניות</h2>
          <p className="text-sm text-[#64748B] mt-0.5">חבר את HeskemFlow לכלים שאתה כבר משתמש בהם</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="group flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${integration.color} text-white text-sm font-bold`}>
                      {integration.letter}
                    </div>
                    <span className="text-sm font-bold text-[#0F172A]">{integration.name}</span>
                  </div>
                  <StatusBadge status={integration.status} />
                </div>
                <p className="text-[13px] leading-relaxed text-[#64748B]">
                  {integration.description}
                </p>
              </div>
              <div className="mt-4">
                {integration.status === "coming_soon" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed text-xs"
                    disabled
                  >
                    בקרוב
                  </Button>
                ) : integration.status === "connected" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs gap-1.5"
                  >
                    <ExternalLink className="size-3.5" />
                    הגדרות
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold gap-1.5"
                  >
                    <ExternalLink className="size-3.5" />
                    חבר עכשיו
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
