import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { statusLabels, statusColors } from "@/lib/contract-utils"
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
      <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <h3 className="text-lg font-bold text-[#0F172A] mb-3">חוזים אחרונים</h3>
        <p className="text-sm text-[#64748B]">אין חוזים עדיין</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
        <h3 className="text-lg font-bold text-[#0F172A]">חוזים אחרונים</h3>
        <Link href="/contracts" className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-semibold">
          הצג הכל
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
            <TableHead className="font-semibold text-[#334155]">כותרת</TableHead>
            <TableHead className="font-semibold text-[#334155]">חברה</TableHead>
            <TableHead className="font-semibold text-[#334155]">סטטוס</TableHead>
            <TableHead className="font-semibold text-[#334155]">סוג</TableHead>
            <TableHead className="font-semibold text-[#334155]">עדכון אחרון</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
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
              <TableCell>
                <Badge className={`text-[10px] font-bold rounded-lg px-2 py-0.5 ${statusColors[contract.status]}`}>
                  {statusLabels[contract.status] ?? contract.status}
                </Badge>
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
