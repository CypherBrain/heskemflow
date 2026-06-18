"use client"

import { useTransition } from "react"
import Link from "next/link"
import {
  statusLabels,
  formatCurrency,
} from "@/lib/contract-utils"
import { StatusBadge } from "@/components/ui/status-badge"
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
  ArrowLeft,
} from "lucide-react"

const ALL_STATUSES: { id: ContractStatus; label: string; dot: string; headerBg: string }[] = [
  { id: "DRAFT", label: "טיוטה", dot: "bg-[#94A3B8]", headerBg: "bg-[#F8FAFC]" },
  { id: "INTERNAL_REVIEW", label: "בדיקה פנימית", dot: "bg-[#F59E0B]", headerBg: "bg-[#FFFBEB]" },
  { id: "LEGAL_REVIEW", label: "בדיקה משפטית", dot: "bg-[#F97316]", headerBg: "bg-[#FFF7ED]" },
  { id: "CLIENT_REVIEW", label: "בדיקת לקוח", dot: "bg-[#3B82F6]", headerBg: "bg-[#EFF6FF]" },
  { id: "CHANGES_REQUESTED", label: "נדרשים שינויים", dot: "bg-[#D97706]", headerBg: "bg-[#FFFBEB]" },
  { id: "APPROVED", label: "מאושר", dot: "bg-[#6366F1]", headerBg: "bg-[#EEF2FF]" },
  { id: "SENT_FOR_SIGNATURE", label: "נשלח לחתימה", dot: "bg-[#8B5CF6]", headerBg: "bg-[#F5F3FF]" },
  { id: "SIGNED", label: "חתום", dot: "bg-[#22C55E]", headerBg: "bg-[#F0FDF4]" },
  { id: "ACTIVE", label: "פעיל", dot: "bg-[#16A34A]", headerBg: "bg-[#F0FDF4]" },
  { id: "EXPIRED", label: "פג תוקף", dot: "bg-[#EF4444]", headerBg: "bg-[#FEF2F2]" },
  { id: "TERMINATED", label: "בוטל", dot: "bg-[#DC2626]", headerBg: "bg-[#FEF2F2]" },
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
      className={`group rounded-2xl bg-white border border-[#E2E8F0] p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-200 space-y-2.5 ${isPending ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div className="flex items-start justify-between gap-1">
        <Link href={`/contracts/${contract.id}`} className="text-sm font-bold leading-tight flex-1 text-[#0F172A] hover:text-[#2563EB] transition-colors">
          {contract.title}
        </Link>
        {risk && (
          <span title={risk.label}>
            <risk.icon className={`size-4 shrink-0 mt-0.5 ${risk.color}`} />
          </span>
        )}
      </div>

      {contract.company && (
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <Building2 className="size-3 shrink-0 text-[#94A3B8]" />
          <span className="truncate">{contract.company.name}</span>
        </div>
      )}

      {contract.contact && (
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <User className="size-3 shrink-0 text-[#94A3B8]" />
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
          <UserCircle className="size-3 shrink-0 text-[#94A3B8]" />
          <span className="truncate">{contract.internalOwner.fullName}</span>
        </div>
      )}

      {contract.renewalDate && (
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <CalendarClock className="size-3 shrink-0 text-[#94A3B8]" />
          <span>
            {new Date(contract.renewalDate).toLocaleDateString("he-IL")}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]/80">
        <StatusBadge status={contract.status} />

        <select
          value={contract.status}
          onChange={handleStatusChange}
          disabled={isPending}
          className="text-[10px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-1.5 py-1 text-[#64748B] cursor-pointer hover:border-[#BFDBFE] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 max-w-[90px] transition-colors"
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
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
      {ALL_STATUSES.map((col) => {
        const colContracts = contracts.filter((c) => c.status === col.id)
        return (
          <div
            key={col.id}
            className="flex-shrink-0 w-[280px] flex flex-col"
          >
            {/* Column header */}
            <div className={`flex items-center gap-2.5 mb-3 sticky top-0 backdrop-blur-sm py-2.5 z-10 rounded-xl px-3 ring-1 ring-[#E2E8F0]/50 ${col.headerBg}`}>
              <div className={`size-2.5 rounded-full ${col.dot} ring-2 ring-white`} />
              <h3 className="text-[13px] font-bold whitespace-nowrap text-[#334155]">
                {col.label}
              </h3>
              <span className="inline-flex items-center justify-center size-5 text-[10px] font-bold rounded-full bg-white text-[#64748B] ring-1 ring-[#E2E8F0]">
                {colContracts.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3 flex-1">
              {colContracts.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-white/50 p-8 text-center">
                  <p className="text-xs text-[#CBD5E1] font-medium">
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
