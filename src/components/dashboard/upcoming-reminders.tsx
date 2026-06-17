import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CalendarClock } from "lucide-react"

interface SerializedRenewalContract {
  id: string
  title: string
  renewalDate: string | null
  company: { name: string } | null
}

export function DashboardRenewals({ contracts }: { contracts: SerializedRenewalContract[] }) {
  if (contracts.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <h3 className="text-lg font-bold text-[#0F172A] mb-3">חידושים קרובים</h3>
        <p className="text-sm text-[#64748B]">אין חידושים קרובים</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h3 className="text-lg font-bold text-[#0F172A]">חידושים קרובים</h3>
      </div>
      <div className="p-4 space-y-2">
        {contracts.map((contract) => {
          const daysUntil = contract.renewalDate
            ? Math.ceil((new Date(contract.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null
          const isUrgent = daysUntil !== null && daysUntil <= 7

          return (
            <Link key={contract.id} href={`/contracts/${contract.id}`} className="block">
              <div className={`flex items-start gap-3 rounded-xl border p-4 transition-all hover:shadow-sm ${isUrgent ? "border-[#FEE2E2] bg-[#FEF2F2]" : "border-[#E2E8F0] hover:bg-[#F8FAFC]"}`}>
                <CalendarClock className={`mt-0.5 size-4 shrink-0 ${isUrgent ? "text-[#DC2626]" : "text-[#D97706]"}`} />
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-semibold text-[#0F172A]">{contract.title}</p>
                  <p className="text-xs text-[#64748B]">{contract.company?.name ?? "—"}</p>
                </div>
                {daysUntil !== null && (
                  <Badge className={`text-[10px] font-bold rounded-lg ${isUrgent ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-[#FEF3C7] text-[#D97706]"}`}>
                    {daysUntil <= 0 ? "עבר" : `בעוד ${daysUntil} ימים`}
                  </Badge>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
