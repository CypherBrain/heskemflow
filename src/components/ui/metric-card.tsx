import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: number | string
  iconBg?: string
  iconColor?: string
  trend?: string
  trendColor?: string
  className?: string
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  iconBg = "bg-[#DBEAFE]",
  iconColor = "text-[#2563EB]",
  trend,
  trendColor = "text-[#94A3B8]",
  className,
}: MetricCardProps) {
  return (
    <div className={cn("metric-card p-5", className)}>
      <div className="flex items-center gap-4">
        <div className={cn("flex size-12 items-center justify-center rounded-2xl", iconBg)}>
          <Icon className={cn("size-6", iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{value}</p>
          <p className="text-xs font-medium text-[#94A3B8] mt-0.5">{label}</p>
          {trend && (
            <p className={cn("text-[10px] font-semibold mt-1", trendColor)}>{trend}</p>
          )}
        </div>
      </div>
    </div>
  )
}
