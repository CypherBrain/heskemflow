import { type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-[#E2E8F0] bg-gradient-to-b from-white to-[#FAFBFE]">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-[#F1F5F9] mb-4">
        <Icon className="size-7 text-[#94A3B8]" />
      </div>
      <p className="text-sm font-bold text-[#334155]">{title}</p>
      {description && (
        <p className="text-[13px] text-[#94A3B8] mt-1.5 max-w-xs text-center leading-relaxed">{description}</p>
      )}
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-5">
          {actionHref ? (
            <Link href={actionHref}>
              <Button size="sm" className="rounded-xl gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] font-semibold shadow-md shadow-blue-500/15">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button size="sm" onClick={onAction} className="rounded-xl gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] font-semibold shadow-md shadow-blue-500/15">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
