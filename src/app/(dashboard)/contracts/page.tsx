import Link from "next/link"
import { getContracts } from "@/actions/contracts"
import { ContractsTable } from "@/components/contracts/contracts-table"
import { serializePrisma } from "@/lib/serialize"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function ContractsPage() {
  const rawContracts = await getContracts()
  const contracts = serializePrisma(rawContracts) as unknown as Parameters<typeof ContractsTable>[0]["contracts"]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">מאגר חוזים</h1>
          <p className="page-description mt-1">
            כל ההסכמים במקום אחד — טיוטות, אישורים, חתימות, חידושים והתחייבויות.
          </p>
        </div>
        <Link href="/contracts/new">
          <Button className="rounded-xl gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] font-semibold shadow-sm">
            <Plus className="size-4" />
            חוזה חדש
          </Button>
        </Link>
      </div>

      <ContractsTable contracts={contracts} />
    </div>
  )
}
