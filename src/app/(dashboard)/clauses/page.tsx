import { getClauses, getClauseFilterOptions } from "@/actions/clauses"
import { serializePrisma } from "@/lib/serialize"
import { ClausesManager } from "@/components/clauses/clauses-manager"

export default async function ClausesPage() {
  const [rawClauses, filterOptions] = await Promise.all([
    getClauses(),
    getClauseFilterOptions(),
  ])

  const clauses = serializePrisma(rawClauses) as unknown as Parameters<
    typeof ClausesManager
  >[0]["clauses"]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">ספריית סעיפים</h1>
        <p className="page-description mt-1">
          סעיפים מוכנים לשילוב בחוזים — ניתן לחפש, לסנן ולערוך
        </p>
      </div>

      <ClausesManager clauses={clauses} filterOptions={filterOptions} />
    </div>
  )
}
