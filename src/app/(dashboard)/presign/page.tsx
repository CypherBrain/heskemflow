import { getPresignContracts } from "@/actions/contracts"
import { KanbanBoard } from "@/components/presign/kanban-board"

export default async function PresignPage() {
  const contracts = await getPresignContracts()

  return (
    <div className="page-shell">
      <div>
        <h1 className="page-title">תהליך טרום-חתימה</h1>
        <p className="page-description mt-2">
          מעקב אחר חוזים בכל שלבי המחזור — שנה סטטוס מהתפריט בכל כרטיס.
        </p>
      </div>

      <KanbanBoard contracts={contracts} />
    </div>
  )
}
