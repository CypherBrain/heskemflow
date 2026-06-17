"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { statusLabels, statusColors, formatCurrency } from "@/lib/contract-utils"
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
  { value: "all", label: "הכל" },
  { value: "ACTIVE", label: "פעיל" },
  { value: "DRAFT", label: "טיוטה" },
  { value: "SENT_FOR_SIGNATURE", label: "ממתין לחתימה" },
  { value: "INTERNAL_REVIEW", label: "בדיקה פנימית" },
  { value: "LEGAL_REVIEW", label: "בדיקה משפטית" },
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
          <Input
            placeholder="חיפוש חוזה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10 h-10 rounded-xl bg-white border-[#E2E8F0] placeholder:text-[#94A3B8]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((sf) => (
            <button
              key={sf.value}
              onClick={() => setFilter(sf.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === sf.value
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#334155]"
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white py-16">
          <FileText className="size-10 text-[#94A3B8] mb-3" />
          <p className="text-[#64748B] font-medium">
            {contracts.length === 0 ? "אין חוזים עדיין" : "לא נמצאו חוזים"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                <TableHead className="font-semibold text-[#334155]">כותרת</TableHead>
                <TableHead className="font-semibold text-[#334155]">חברה</TableHead>
                <TableHead className="font-semibold text-[#334155]">סוג</TableHead>
                <TableHead className="font-semibold text-[#334155]">סטטוס</TableHead>
                <TableHead className="font-semibold text-[#334155]">שווי</TableHead>
                <TableHead className="font-semibold text-[#334155]">עדכון אחרון</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((contract) => (
                <TableRow key={contract.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <TableCell>
                    <Link href={`/contracts/${contract.id}`} className="font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors">
                      {contract.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {contract.company ? (
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-[#F1F5F9] text-[10px] font-bold text-[#64748B]">
                          {getInitials(contract.company.name)}
                        </div>
                        <span className="text-sm text-[#334155]">{contract.company.name}</span>
                      </div>
                    ) : (
                      <span className="text-[#94A3B8]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-[#64748B]">
                    {contract.contractType}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] font-bold rounded-lg px-2 py-0.5 ${statusColors[contract.status]}`}>
                      {statusLabels[contract.status] ?? contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-[#0F172A]">
                    {formatCurrency(contract.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-[#94A3B8]">
                    {contract.updatedAt
                      ? new Date(contract.updatedAt).toLocaleDateString("he-IL")
                      : "—"}
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
