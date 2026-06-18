import { cn } from "@/lib/utils"

const priorityConfig: Record<string, { label: string; className: string }> = {
  LOW: { label: "נמוך", className: "bg-[#F1F5F9] text-[#64748B] ring-[#E2E8F0]" },
  MEDIUM: { label: "בינוני", className: "bg-[#DBEAFE] text-[#2563EB] ring-[#BFDBFE]" },
  HIGH: { label: "גבוה", className: "bg-[#FEF3C7] text-[#D97706] ring-[#FDE68A]" },
  CRITICAL: { label: "קריטי", className: "bg-[#FEE2E2] text-[#DC2626] ring-[#FECACA]" },
}

interface PriorityBadgeProps {
  priority: string
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority] ?? priorityConfig.LOW

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-lg ring-1",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
