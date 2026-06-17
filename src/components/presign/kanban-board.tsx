"use client"

import { useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import {
  statusLabels,
  statusColors,
  formatCurrency,
} from "@/lib/contract-utils"
import { updateContractStatus } from "@/actions/contracts"
import type { PresignContract } from "@/actions/contracts"
import type { ContractStatus } from "@prisma/client"
import {
  Building2,
  User,
  UserCircle,
  CalendarClock,
  AlertTriangle,
  Eye,
} from "lucide-react"

const ALL_STATUSES: { id: ContractStatus; label: string; dot: string }[] = [
  { id: "DRAFT", label: "טיוטה", dot: "bg-[#94A3B8]" },
  { id: "INTERNAL_REVIEW", label: "בדיקה פנימית", dot: "bg-[#F59E0B]" },
  { id: "LEGAL_REVIEW", label: "בדיקה משפטית", dot: "bg-[#F97316]" },
  { id: "CLIENT_REVIEW", label: "בדיקת לקוח", dot: "bg-[#3B82F6]" },
  { id: "CHANGES_REQUESTED", label: "נדרשים שינויים", dot: "bg-[#D97706]" },
  { id: "APPROVED", label: "מאושר", dot: "bg-[#6366F1]" },
  { id: "SENT_FOR_SIGNATURE", label: "נשלח לחתימה", dot: "bg-[#8B5CF6]" },
  { id: "SIGNED", label: "חתום", dot: "bg-[#22C55E]" },
  { id: "ACTIVE", label: "פעיל", dot: "bg-[#16A34A]" },
  { id: "EXPIRED", label: "פג תוקף", dot: "bg-[#EF4444]" },
  { id: "TERMINATED", label: "בוטל", dot: "bg-[#DC2626]" },
]

const REVIEW_STATUSES = new Set<ContractStatus>([
  "INTERNAL_REVIEW",
  "LEGAL_REVIEW",
  "CLIENT_REVIEW",
  "CHANGES_REQUESTED",
])

function getRiskIndicator(contract: PresignContract) {
  if (REVIEW_STATUSES.has(contract.status)) {
    return { icon: Eye, label: "בבדיקה", color: "text-[#D97706]" }
  }

  if (contract.renewalDate) {
    const daysUntil = Math.ceil(
      (new Date(contract.renewalDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    )
    if (daysUntil <= 0) {
      return { icon: AlertTriangle, label: "עבר חידוש", color: "text-[#DC2626]" }
    }
    if (daysUntil <= 30) {
      return {
        icon: AlertTriangle,
        label: `חידוש בעוד ${daysUntil} ימים`,
        color: "text-[#D97706]",
      }
    }
  }

  return null
}

function ContractCard({ contract }: { contract: PresignContract }) {
  const [isPending, startTransition] = useTransition()
  const risk = getRiskIndicator(contract)

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as ContractStatus
    if (newStatus === contract.status) return

    startTransition(async () => {
      await updateContractStatus(contract.id, newStatus)
    })
  }

  return (
    <div
      className={`rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition-all duration-200 space-y-2.5 ${isPending ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-sm font-bold leading-tight flex-1 text-[#0F172A]">
          {contract.title}
        </p>
        {risk && (
          <span title={risk.label}>
            <risk.icon className={`size-4 shrink-0 mt-0.5 ${risk.color}`} />
          </span>
        )}
      </div>

      {contract.company && (
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <Building2 className="size-3 shrink-0" />
          <span className="truncate">{contract.company.name}</span>
        </div>
      )}

      {contract.contact && (
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <User className="size-3 shrink-0" />
          <span className="truncate">{contract.contact.fullName}</span>
        </div>
      )}

      {contract.amount != null && Number(contract.amount) > 0 && (
        <p className="text-xs font-bold text-[#2563EB]">
          {formatCurrency(Number(contract.amount), contract.currency)}
        </p>
      )}

      {contract.internalOwner && (
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <UserCircle className="size-3 shrink-0" />
          <span className="truncate">{contract.internalOwner.fullName}</span>
        </div>
      )}

      {contract.renewalDate && (
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <CalendarClock className="size-3 shrink-0" />
          <span>
            {new Date(contract.renewalDate).toLocaleDateString("he-IL")}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
        <Badge className={`text-[10px] font-bold rounded-lg px-2 py-0.5 ${statusColors[contract.status]}`}>
          {statusLabels[contract.status]}
        </Badge>

        <select
          value={contract.status}
          onChange={handleStatusChange}
          disabled={isPending}
          className="text-[10px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-1.5 py-1 text-[#64748B] cursor-pointer hover:border-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 max-w-[90px]"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function KanbanBoard({ contracts }: { contracts: PresignContract[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
      {ALL_STATUSES.map((col) => {
        const colContracts = contracts.filter((c) => c.status === col.id)
        return (
          <div
            key={col.id}
            className="flex-shrink-0 w-[270px] flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3 sticky top-0 bg-[#F6F8FB]/95 backdrop-blur-sm py-2 z-10 rounded-xl px-2">
              <div className={`size-2.5 rounded-full ${col.dot}`} />
              <h3 className="text-sm font-bold whitespace-nowrap text-[#334155]">
                {col.label}
              </h3>
              <Badge className="text-[10px] font-bold rounded-full bg-[#F1F5F9] text-[#64748B] px-2 py-0">
                {colContracts.length}
              </Badge>
            </div>

            <div className="space-y-2.5 flex-1">
              {colContracts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white/50 p-6 text-center">
                  <p className="text-xs text-[#94A3B8]">
                    אין חוזים בשלב זה
                  </p>
                </div>
              ) : (
                colContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
