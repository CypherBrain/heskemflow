import { cn } from "@/lib/utils"

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "טיוטה", className: "bg-[#F1F5F9] text-[#64748B] ring-[#E2E8F0]" },
  INTERNAL_REVIEW: { label: "בדיקה פנימית", className: "bg-[#DBEAFE] text-[#2563EB] ring-[#BFDBFE]" },
  LEGAL_REVIEW: { label: "בדיקה משפטית", className: "bg-[#EDE9FE] text-[#7C3AED] ring-[#DDD6FE]" },
  CLIENT_REVIEW: { label: "אצל הלקוח", className: "bg-[#FEF3C7] text-[#D97706] ring-[#FDE68A]" },
  CHANGES_REQUIRED: { label: "שינויים נדרשים", className: "bg-[#FEE2E2] text-[#DC2626] ring-[#FECACA]" },
  APPROVED: { label: "מאושר", className: "bg-[#DCFCE7] text-[#16A34A] ring-[#BBF7D0]" },
  SENT_FOR_SIGNATURE: { label: "נשלח לחתימה", className: "bg-[#DBEAFE] text-[#1E40AF] ring-[#BFDBFE]" },
  SIGNED: { label: "חתום", className: "bg-[#DCFCE7] text-[#15803D] ring-[#BBF7D0]" },
  ACTIVE: { label: "פעיל", className: "bg-[#DCFCE7] text-[#16A34A] ring-[#BBF7D0]" },
  EXPIRED: { label: "פג תוקף", className: "bg-[#F1F5F9] text-[#94A3B8] ring-[#E2E8F0]" },
  CANCELLED: { label: "בוטל", className: "bg-[#FEE2E2] text-[#DC2626] ring-[#FECACA]" },
}

interface StatusBadgeProps {
  status: string
  size?: "sm" | "md"
  className?: string
}

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: "bg-[#F1F5F9] text-[#64748B] ring-[#E2E8F0]" }

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold rounded-lg ring-1",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
