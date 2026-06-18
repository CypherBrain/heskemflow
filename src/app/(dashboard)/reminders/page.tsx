import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Bell, CalendarClock, CheckCircle2, Clock } from "lucide-react"
import { formatDate } from "@/lib/contract-utils"

export default async function RemindersPage() {
  const { organizationId } = await getCurrentUser()
  const [reminders, contractsWithRenewal] = await Promise.all([
    prisma.renewalReminder.findMany({
      where: { contract: { organizationId } },
      orderBy: { reminderDate: "asc" },
      include: { contract: { include: { company: true } } },
    }),
    prisma.contract.findMany({
      where: {
        organizationId,
        renewalDate: { not: null },
      },
      orderBy: { renewalDate: "asc" },
      include: { company: true },
    }),
  ])

  const scheduled = reminders.filter((r) => r.status === "SCHEDULED")
  const sent = reminders.filter((r) => r.status === "SENT")

  const statCards = [
    {
      icon: CalendarClock,
      value: scheduled.length,
      label: "תזכורות מתוזמנות",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      icon: Bell,
      value: sent.length,
      label: "נשלחו",
      iconBg: "bg-[#DBEAFE]",
      iconColor: "text-[#2563EB]",
    },
    {
      icon: CheckCircle2,
      value: contractsWithRenewal.length,
      label: "חוזים עם חידוש",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ]

  return (
    <div className="page-shell">
      <div>
        <h1 className="page-title">תזכורות ומועדים</h1>
        <p className="page-description mt-2">
          מעקב אחר חידושים, תפוגות והתחייבויות — כדי שלא תפספס שום דדליין.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="metric-card p-5"
          >
            <div className="flex items-center gap-4">
              <div className={`flex size-12 items-center justify-center rounded-2xl ${card.iconBg}`}>
                <card.icon className={`size-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#0F172A] tracking-tight">{card.value}</p>
                <p className="text-xs font-medium text-[#94A3B8]">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contractsWithRenewal.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">חוזים לחידוש</h2>
            <p className="text-sm text-[#64748B] mt-0.5">חוזים עם תאריך חידוש קרוב</p>
          </div>
          <div className="space-y-3">
            {contractsWithRenewal.map((contract) => {
              const daysUntil = contract.renewalDate
                ? Math.ceil((contract.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null
              const isUrgent = daysUntil !== null && daysUntil <= 30
              const isPast = daysUntil !== null && daysUntil <= 0

              return (
                <div
                  key={contract.id}
                  className="premium-card flex items-center gap-4 p-5 hover:shadow-[0_24px_50px_rgba(15,23,42,0.08)] transition-all duration-200"
                >
                  <div className={`flex size-10 items-center justify-center rounded-xl ${
                    isPast ? "bg-red-50" : isUrgent ? "bg-amber-50" : "bg-emerald-50"
                  }`}>
                    <CalendarClock className={`size-5 ${
                      isPast ? "text-red-500" : isUrgent ? "text-amber-500" : "text-emerald-500"
                    }`} />
                  </div>

                  <div className={`w-1 self-stretch rounded-full ${
                    isPast ? "bg-red-400" : isUrgent ? "bg-amber-400" : "bg-emerald-400"
                  }`} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0F172A] truncate">{contract.title}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {contract.company?.name ?? "—"} • חידוש: {formatDate(contract.renewalDate)}
                    </p>
                  </div>

                  <Badge
                    variant={isPast ? "destructive" : isUrgent ? "destructive" : "outline"}
                    className={`shrink-0 text-[11px] font-semibold ${
                      !isPast && !isUrgent ? "border-[#E2E8F0] text-[#334155]" : ""
                    }`}
                  >
                    {daysUntil !== null
                      ? isPast
                        ? "עבר"
                        : `בעוד ${daysUntil} ימים`
                      : "—"}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {reminders.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">תזכורות מוגדרות</h2>
            <p className="text-sm text-[#64748B] mt-0.5">תזכורות שהוגדרו לחוזים ספציפיים</p>
          </div>
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="premium-card flex items-center gap-4 p-5"
              >
                <div className={`flex size-10 items-center justify-center rounded-xl ${
                  reminder.status === "SCHEDULED" ? "bg-[#DBEAFE]" : "bg-emerald-50"
                }`}>
                  {reminder.status === "SCHEDULED" ? (
                    <Clock className="size-5 text-[#2563EB]" />
                  ) : (
                    <CheckCircle2 className="size-5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0F172A]">{reminder.reminderType}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {reminder.contract.title} • {formatDate(reminder.reminderDate)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[11px] font-semibold ${
                    reminder.status === "SCHEDULED"
                      ? "border-[#DBEAFE] bg-[#DBEAFE]/50 text-[#2563EB]"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {reminder.status === "SCHEDULED" ? "מתוזמן" : reminder.status === "SENT" ? "נשלח" : reminder.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminders.length === 0 && contractsWithRenewal.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-[#E2E8F0] bg-gradient-to-b from-white to-[#FAFBFE]">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-[#F1F5F9] mb-4">
            <Bell className="size-7 text-[#94A3B8]" />
          </div>
          <p className="text-sm font-bold text-[#334155]">אין תזכורות עדיין</p>
          <p className="text-[13px] text-[#94A3B8] mt-1.5 max-w-xs text-center">תזכורות יופיעו כאן כשתוסיף מועדי חידוש לחוזים</p>
        </div>
      )}
    </div>
  )
}
