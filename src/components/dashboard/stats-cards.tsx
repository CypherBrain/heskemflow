import { FileText, Clock, CalendarClock, AlertTriangle, BarChart3, AlertCircle } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    activeContracts: number
    pendingSignature: number
    renewalsNext30Days: number
    pendingReview: number
    totalContracts: number
  }
  overdueObligations?: number
}

export function DashboardStats({ stats, overdueObligations = 0 }: DashboardStatsProps) {
  const items = [
    {
      label: "סה״כ חוזים",
      value: stats.totalContracts,
      icon: BarChart3,
      iconBg: "bg-[#EDE9FE]",
      iconColor: "text-[#7C3AED]",
    },
    {
      label: "חוזים פעילים",
      value: stats.activeContracts,
      icon: FileText,
      iconBg: "bg-[#DBEAFE]",
      iconColor: "text-[#2563EB]",
    },
    {
      label: "ממתינים לחתימה",
      value: stats.pendingSignature,
      icon: Clock,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#D97706]",
    },
    {
      label: "דורשים בדיקה",
      value: stats.pendingReview,
      icon: AlertTriangle,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#D97706]",
    },
    {
      label: "חידושים ב-30 יום",
      value: stats.renewalsNext30Days,
      icon: CalendarClock,
      iconBg: "bg-[#FEE2E2]",
      iconColor: "text-[#DC2626]",
    },
    {
      label: "התחייבויות באיחור",
      value: overdueObligations,
      icon: AlertCircle,
      iconBg: "bg-[#FEE2E2]",
      iconColor: "text-[#DC2626]",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="metric-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`flex size-11 items-center justify-center rounded-2xl ${item.iconBg}`}>
                <Icon className={`size-5 ${item.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-extrabold text-[#0F172A] tracking-tight">{item.value}</p>
                <p className="text-[11px] text-[#94A3B8] font-medium">{item.label}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
