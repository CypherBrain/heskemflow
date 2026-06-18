import { getTemplates, getTemplateFilterOptions } from "@/actions/templates"
import { serializePrisma } from "@/lib/serialize"
import { TemplatesManager } from "@/components/templates/templates-manager"

export default async function TemplatesPage() {
  const [rawTemplates, filterOptions] = await Promise.all([
    getTemplates({ includeInactive: true }),
    getTemplateFilterOptions(),
  ])

  const templates = serializePrisma(rawTemplates) as unknown as Parameters<
    typeof TemplatesManager
  >[0]["templates"]

  return (
    <div className="page-shell">
      <div>
        <h1 className="page-title">תבניות חוזים</h1>
        <p className="page-description mt-2">
          ספריית תבניות ליצירה מהירה של חוזים מותאמים אישית.
        </p>
      </div>

      <TemplatesManager templates={templates} filterOptions={filterOptions} />
    </div>
  )
}
