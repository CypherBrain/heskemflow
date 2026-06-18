import { cn } from "@/lib/utils"

const departmentColors: Record<string, string> = {
  "משפטי": "bg-[#EDE9FE] text-[#7C3AED] ring-[#DDD6FE]",
  "כספים": "bg-[#DCFCE7] text-[#16A34A] ring-[#BBF7D0]",
  "מכירות": "bg-[#DBEAFE] text-[#2563EB] ring-[#BFDBFE]",
  "תפעול": "bg-[#FEF3C7] text-[#D97706] ring-[#FDE68A]",
  "HR": "bg-[#FCE7F3] text-[#DB2777] ring-[#FBCFE8]",
  "IT": "bg-[#E0E7FF] text-[#4F46E5] ring-[#C7D2FE]",
  "הנהלה": "bg-[#F1F5F9] text-[#0F172A] ring-[#E2E8F0]",
}

const defaultColor = "bg-[#F1F5F9] text-[#64748B] ring-[#E2E8F0]"

interface DepartmentBadgeProps {
  name: string
  className?: string
}

export function DepartmentBadge({ name, className }: DepartmentBadgeProps) {
  const colorClass = departmentColors[name] ?? defaultColor

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-lg ring-1",
        colorClass,
        className,
      )}
    >
      {name}
    </span>
  )
}
