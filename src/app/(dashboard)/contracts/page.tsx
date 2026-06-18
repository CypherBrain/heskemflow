import Link from "next/link"
import { getContracts } from "@/actions/contracts"
import { ContractsTable } from "@/components/contracts/contracts-table"
import { serializePrisma } from "@/lib/serialize"
import { Button } from "@/components/ui/button"
import { Plus, Brain } from "lucide-react"

export default async function ContractsPage() {
  const rawContracts = await getContracts()
  const contracts = serializePrisma(rawContracts) as unknown as Parameters<typeof ContractsTable>[0]["contracts"]

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">מאגר חוזים</h1>
          <p className="page-description mt-2">
            כל ההסכמים, הסטטוסים, החידושים והאחריות במקום אחד.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl gap-2 border-[#E2E8F0] text-[#64748B] hover:text-[#7C3AED] hover:border-[#EDE9FE] hover:bg-[#FAFAFF] font-medium transition-all duration-200">
            <Brain className="size-4" />
            <span className="hidden sm:inline">הפעל בדיקת AI</span>
          </Button>
          <Link href="/contracts/new">
            <Button className="rounded-xl gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] font-semibold shadow-md shadow-blue-500/15 transition-all duration-200 hover:shadow-lg">
              <Plus className="size-4" />
              חוזה חדש
            </Button>
          </Link>
        </div>
      </div>

      <ContractsTable contracts={contracts} />
    </div>
  )
}
