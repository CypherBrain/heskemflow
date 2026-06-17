import { FileText, Clock, CalendarClock, AlertTriangle, BarChart3 } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    activeContracts: number
    pendingSignature: number
    renewalsNext30Days: number
    pendingReview: number
    totalContracts: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const items = [
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
      label: "חידושים ב-30 יום",
      value: stats.renewalsNext30Days,
      icon: CalendarClock,
      iconBg: "bg-[#FEE2E2]",
      iconColor: "text-[#DC2626]",
    },
    {
      label: "ממתינים לבדיקה",
      value: stats.pendingReview,
      icon: AlertTriangle,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#D97706]",
    },
    {
      label: "סה״כ חוזים",
      value: stats.totalContracts,
      icon: BarChart3,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#16A34A]",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="group relative overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] font-medium">{item.label}</p>
                <p className="mt-1.5 text-3xl font-extrabold text-[#0F172A] tracking-tight">{item.value}</p>
              </div>
              <div className={`rounded-xl p-3 ${item.iconBg}`}>
                <Icon className={`size-5 ${item.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
