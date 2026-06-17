import { statusLabels } from "@/lib/contract-utils"
import type { ContractStatus } from "@prisma/client"

interface StatusData {
  status: ContractStatus
  count: number
}

const barColors: Record<string, string> = {
  DRAFT: "bg-[#94A3B8]",
  INTERNAL_REVIEW: "bg-[#F59E0B]",
  LEGAL_REVIEW: "bg-[#F97316]",
  CLIENT_REVIEW: "bg-[#3B82F6]",
  CHANGES_REQUESTED: "bg-[#D97706]",
  APPROVED: "bg-[#6366F1]",
  SENT_FOR_SIGNATURE: "bg-[#8B5CF6]",
  SIGNED: "bg-[#22C55E]",
  ACTIVE: "bg-[#16A34A]",
  EXPIRED: "bg-[#EF4444]",
  TERMINATED: "bg-[#DC2626]",
}

export function DashboardStatusChart({ data }: { data: StatusData[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h3 className="text-lg font-bold text-[#0F172A]">התפלגות סטטוסים</h3>
      </div>
      <div className="p-6 space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-[#64748B]">אין נתונים</p>
        ) : (
          data.map(({ status, count }) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={status} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#334155]">{statusLabels[status] ?? status}</span>
                  <span className="text-[#94A3B8] text-xs font-semibold">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#F1F5F9]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColors[status] ?? "bg-[#94A3B8]"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
