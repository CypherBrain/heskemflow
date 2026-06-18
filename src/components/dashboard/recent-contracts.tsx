import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { statusLabels, statusColors } from "@/lib/contract-utils"
import { StatusBadge } from "@/components/ui/status-badge"
import { FileText, ArrowLeft } from "lucide-react"
import type { ContractStatus } from "@prisma/client"

interface SerializedContract {
  id: string
  title: string
  contractType: string
  status: ContractStatus
  updatedAt: string
  company: { name: string } | null
  contact: { fullName: string } | null
  template: { name: string } | null
  internalOwner: { fullName: string } | null
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2)
}

export function DashboardRecentContracts({ contracts }: { contracts: SerializedContract[] }) {
  if (contracts.length === 0) {
    return (
      <div className="premium-card p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F1F5F9] mx-auto mb-4">
          <FileText className="size-6 text-[#94A3B8]" />
        </div>
        <h3 className="text-base font-bold text-[#0F172A] mb-1">חוזים אחרונים</h3>
        <p className="text-sm text-[#94A3B8]">עדיין אין חוזים להצגה</p>
        <Link href="/contracts/new" className="inline-flex items-center gap-1 text-sm text-[#2563EB] font-semibold mt-3 hover:underline">
          צור חוזה ראשון
          <ArrowLeft className="size-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="premium-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]/80">
        <h3 className="text-base font-bold text-[#0F172A]">חוזים אחרונים</h3>
        <Link href="/contracts" className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-semibold flex items-center gap-1 transition-colors">
          הצג הכל
          <ArrowLeft className="size-3.5" />
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#64748B]">כותרת</TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#64748B]">חברה</TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#64748B]">סטטוס</TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#64748B]">סוג</TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#64748B]">עדכון</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id} className="hover:bg-[#F8FAFC]/80 transition-colors group">
              <TableCell>
                <Link href={`/contracts/${contract.id}`} className="font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors text-sm">
                  {contract.title}
                </Link>
              </TableCell>
              <TableCell>
                {contract.company ? (
                  <div className="flex items-center gap-2">
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
                <StatusBadge status={contract.status} />
              </TableCell>
              <TableCell className="text-sm text-[#64748B]">
                {contract.contractType}
              </TableCell>
              <TableCell className="text-sm text-[#94A3B8]">
                {new Date(contract.updatedAt).toLocaleDateString("he-IL")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
