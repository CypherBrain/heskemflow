import { getPresignContracts } from "@/actions/contracts"
import { KanbanBoard } from "@/components/presign/kanban-board"

export default async function PresignPage() {
  const contracts = await getPresignContracts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">תהליך טרום-חתימה</h1>
        <p className="page-description mt-1">
          מעקב אחר חוזים בכל שלבי המחזור — שנה סטטוס מהתפריט בכל כרטיס
        </p>
      </div>

      <KanbanBoard contracts={contracts} />
    </div>
  )
}
