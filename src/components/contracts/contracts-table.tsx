"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, FileText, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { formatCurrency } from "@/lib/contract-utils"
import type { ContractStatus } from "@prisma/client"

interface SerializedContract {
  id: string
  title: string
  contractType: string
  status: ContractStatus
  amount: number | null
  currency: string
  startDate: string | null
  endDate: string | null
  updatedAt: string
  company: { name: string } | null
  contact: { fullName: string } | null
  template: { name: string } | null
  internalOwner: { fullName: string } | null
}

const statusFilters: { value: string; label: string }[] = [
  { value: "all", label: "הכול" },
  { value: "ACTIVE", label: "פעיל" },
  { value: "DRAFT", label: "טיוטה" },
  { value: "SENT_FOR_SIGNATURE", label: "ממתין לחתימה" },
  { value: "INTERNAL_REVIEW", label: "בדיקה פנימית" },
  { value: "LEGAL_REVIEW", label: "בדיקה משפטית" },
  { value: "CLIENT_REVIEW", label: "אצל הלקוח" },
  { value: "CHANGES_REQUIRED", label: "שינויים נדרשים" },
  { value: "APPROVED", label: "מאושר" },
  { value: "SIGNED", label: "חתום" },
]

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2)
}

export function ContractsTable({ contracts }: { contracts: SerializedContract[] }) {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  const filtered = contracts.filter((contract) => {
    const matchesStatus = filter === "all" || contract.status === filter
    const matchesSearch =
      search === "" ||
      contract.title.includes(search) ||
      contract.company?.name.includes(search)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-5">
      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
          <Input
            placeholder="חיפוש לפי שם חוזה או חברה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10 h-11 rounded-xl bg-white border-[#E2E8F0] placeholder:text-[#94A3B8] focus:border-[#2563EB] transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((sf) => (
            <button
              key={sf.value}
              onClick={() => setFilter(sf.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                filter === sf.value
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/15"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#334155] hover:border-[#DBEAFE]"
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-[#E2E8F0] bg-gradient-to-b from-white to-[#FAFBFE]">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-[#F1F5F9] mb-4">
            <FileText className="size-7 text-[#94A3B8]" />
          </div>
          <p className="text-sm font-bold text-[#334155]">
            {contracts.length === 0 ? "עדיין אין חוזים להצגה" : "לא נמצאו חוזים מתאימים"}
          </p>
          <p className="text-[13px] text-[#94A3B8] mt-1.5">
            {contracts.length === 0 ? "צור חוזה ראשון כדי להתחיל לנהל את התהליך" : "נסה לשנות את מסנני החיפוש"}
          </p>
          {contracts.length === 0 && (
            <Link href="/contracts/new" className="mt-5">
              <button className="rounded-xl px-4 py-2 text-sm bg-[#2563EB] text-white font-semibold shadow-md shadow-blue-500/15 hover:bg-[#1D4ED8] transition-colors">
                צור חוזה חדש
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#64748B]">כותרת</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#64748B]">חברה</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#64748B]">סוג</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#64748B]">סטטוס</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#64748B]">שווי</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#64748B]">עדכון</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((contract) => (
                <TableRow key={contract.id} className="hover:bg-[#F8FAFC]/80 transition-all duration-150 group">
                  <TableCell>
                    <Link href={`/contracts/${contract.id}`} className="font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors text-sm">
                      {contract.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {contract.company ? (
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] text-[10px] font-bold text-[#64748B]">
                          {getInitials(contract.company.name)}
                        </div>
                        <span className="text-sm text-[#334155]">{contract.company.name}</span>
                      </div>
                    ) : (
                      <span className="text-[#CBD5E1]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[#64748B]">{contract.contractType}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={contract.status} />
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-[#0F172A] tabular-nums">
                    {formatCurrency(contract.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-[#94A3B8]">
                    {contract.updatedAt
                      ? new Date(contract.updatedAt).toLocaleDateString("he-IL")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/contracts/${contract.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowLeft className="size-4 text-[#94A3B8] hover:text-[#2563EB]" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
