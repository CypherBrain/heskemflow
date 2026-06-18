import Link from "next/link"
import { CalendarClock, ArrowLeft } from "lucide-react"

interface SerializedRenewalContract {
  id: string
  title: string
  renewalDate: string | null
  company: { name: string } | null
}

export function DashboardRenewals({ contracts }: { contracts: SerializedRenewalContract[] }) {
  return (
    <div className="premium-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]/80">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-[#FEE2E2]">
            <CalendarClock className="size-4 text-[#DC2626]" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">חידושים קרובים</h3>
        </div>
        <Link href="/contracts" className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold flex items-center gap-1 transition-colors">
          הכל
          <ArrowLeft className="size-3" />
        </Link>
      </div>

      {contracts.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <CalendarClock className="size-10 text-[#E2E8F0] mx-auto mb-3" />
          <p className="text-sm text-[#94A3B8] font-medium">אין חידושים קרובים</p>
          <p className="text-xs text-[#CBD5E1] mt-1">כל החוזים מעודכנים</p>
        </div>
      ) : (
        <div className="p-3 space-y-2">
          {contracts.map((contract) => {
            const daysUntil = contract.renewalDate
              ? Math.ceil((new Date(contract.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null
            const isUrgent = daysUntil !== null && daysUntil <= 7

            return (
              <Link key={contract.id} href={`/contracts/${contract.id}`} className="block">
                <div className={`flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-200 hover:shadow-sm ${isUrgent ? "border-[#FECACA] bg-[#FEF2F2]" : "border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#DBEAFE]"}`}>
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${isUrgent ? "bg-[#FEE2E2]" : "bg-[#FEF3C7]"}`}>
                    <CalendarClock className={`size-4 ${isUrgent ? "text-[#DC2626]" : "text-[#D97706]"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">{contract.title}</p>
                    <p className="text-[11px] text-[#94A3B8]">{contract.company?.name ?? "—"}</p>
                  </div>
                  {daysUntil !== null && (
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-lg ring-1 ${isUrgent ? "bg-[#FEE2E2] text-[#DC2626] ring-[#FECACA]" : "bg-[#FEF3C7] text-[#D97706] ring-[#FDE68A]"}`}>
                      {daysUntil <= 0 ? "עבר" : `בעוד ${daysUntil} ימים`}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
