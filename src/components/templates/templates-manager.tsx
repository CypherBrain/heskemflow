"use client"

import { useState, useTransition } from "react"
import {
  Plus,
  Search,
  FileText,
  Edit,
  Eye,
  Power,
  PowerOff,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import {
  createTemplate,
  updateTemplate,
  deactivateTemplate,
  activateTemplate,
} from "@/actions/templates"

interface IndustryPack {
  id: string
  name: string
  slug: string
}

interface SerializedTemplate {
  id: string
  name: string
  language: string
  contractType: string
  content: unknown
  isActive: boolean
  industryPackId: string | null
  createdAt: string
  industryPack: { id: string; name: string; slug: string } | null
  _count: { contracts: number }
}

interface FilterOptions {
  contractTypes: string[]
  languages: string[]
  industryPacks: IndustryPack[]
}

const contractTypeLabels: Record<string, string> = {
  "Service Agreement": "הסכם שירותים",
  NDA: "הסכם סודיות",
  Employment: "חוזה העסקה",
  Sales: "הסכם מכירות",
  License: "הסכם רישיון",
  Partnership: "הסכם שותפות",
  Consulting: "הסכם ייעוץ",
  Lease: "הסכם השכרה",
}

const contractTypeOptions = [
  { value: "Service Agreement", label: "הסכם שירותים" },
  { value: "NDA", label: "הסכם סודיות" },
  { value: "Employment", label: "חוזה העסקה" },
  { value: "Sales", label: "הסכם מכירות" },
  { value: "License", label: "הסכם רישיון" },
  { value: "Partnership", label: "הסכם שותפות" },
  { value: "Consulting", label: "הסכם ייעוץ" },
  { value: "Lease", label: "הסכם השכרה" },
]

const languageOptions = [
  { value: "he", label: "עברית" },
  { value: "en", label: "English" },
  { value: "ar", label: "ערבית" },
]

function formatLanguage(lang: string) {
  return languageOptions.find((l) => l.value === lang)?.label ?? lang
}

export function TemplatesManager({
  templates: initialTemplates,
  filterOptions,
}: {
  templates: SerializedTemplate[]
  filterOptions: FilterOptions
}) {
  const [isPending, startTransition] = useTransition()
  const [templates] = useState(initialTemplates)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterLang, setFilterLang] = useState("all")
  const [filterIndustry, setFilterIndustry] = useState("all")
  const [showInactive, setShowInactive] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SerializedTemplate | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    language: "he",
    contractType: "",
    industryPackId: "",
    isActive: true,
    contentSections: "",
  })

  const [error, setError] = useState("")

  const filtered = templates.filter((t) => {
    if (!showInactive && !t.isActive) return false
    if (filterType !== "all" && t.contractType !== filterType) return false
    if (filterLang !== "all" && t.language !== filterLang) return false
    if (filterIndustry !== "all" && t.industryPack?.slug !== filterIndustry) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        t.name.toLowerCase().includes(s) ||
        t.contractType.toLowerCase().includes(s)
      )
    }
    return true
  })

  function resetForm() {
    setFormData({
      name: "",
      language: "he",
      contractType: "",
      industryPackId: "",
      isActive: true,
      contentSections: "",
    })
    setError("")
  }

  function openCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function openEdit(t: SerializedTemplate) {
    setSelectedTemplate(t)
    const content = t.content as { sections?: string[] }
    setFormData({
      name: t.name,
      language: t.language,
      contractType: t.contractType,
      industryPackId: t.industryPackId || "",
      isActive: t.isActive,
      contentSections: content?.sections?.join("\n") || JSON.stringify(t.content, null, 2),
    })
    setError("")
    setEditOpen(true)
  }

  function openPreview(t: SerializedTemplate) {
    setSelectedTemplate(t)
    setPreviewOpen(true)
  }

  function handleCreate() {
    if (!formData.name || !formData.contractType) {
      setError("שם וסוג חוזה הם שדות חובה")
      return
    }

    const sections = formData.contentSections
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)

    startTransition(async () => {
      try {
        await createTemplate({
          name: formData.name,
          language: formData.language,
          contractType: formData.contractType,
          content: { title: formData.name, sections },
          industryPackId: formData.industryPackId || undefined,
          isActive: formData.isActive,
        })
        setCreateOpen(false)
        resetForm()
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה ביצירת התבנית")
      }
    })
  }

  function handleUpdate() {
    if (!selectedTemplate) return
    if (!formData.name || !formData.contractType) {
      setError("שם וסוג חוזה הם שדות חובה")
      return
    }

    const sections = formData.contentSections
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)

    startTransition(async () => {
      try {
        await updateTemplate(selectedTemplate.id, {
          name: formData.name,
          language: formData.language,
          contractType: formData.contractType,
          content: { title: formData.name, sections },
          industryPackId: formData.industryPackId || null,
          isActive: formData.isActive,
        })
        setEditOpen(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה בעדכון התבנית")
      }
    })
  }

  function handleToggleActive(t: SerializedTemplate) {
    startTransition(async () => {
      try {
        if (t.isActive) {
          await deactivateTemplate(t.id)
        } else {
          await activateTemplate(t.id)
        }
      } catch (e) {
        console.error(e)
      }
    })
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="חיפוש תבנית..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          תבנית חדשה
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-md border bg-background px-3 py-1.5 text-xs"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">כל הסוגים</option>
          {filterOptions.contractTypes.map((t) => (
            <option key={t} value={t}>
              {contractTypeLabels[t] || t}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border bg-background px-3 py-1.5 text-xs"
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value)}
        >
          <option value="all">כל השפות</option>
          {filterOptions.languages.map((l) => (
            <option key={l} value={l}>
              {formatLanguage(l)}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border bg-background px-3 py-1.5 text-xs"
          value={filterIndustry}
          onChange={(e) => setFilterIndustry(e.target.value)}
        >
          <option value="all">כל התעשיות</option>
          {filterOptions.industryPacks.map((ip) => (
            <option key={ip.id} value={ip.slug}>
              {ip.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="size-3.5"
          />
          הצג לא פעילים
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <FileText className="size-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {templates.length === 0 ? "אין תבניות עדיין" : "לא נמצאו תבניות"}
          </p>
          {templates.length === 0 && (
            <Button variant="outline" className="mt-3" onClick={openCreate}>
              צור תבנית ראשונה
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <Card
              key={template.id}
              className={`hover:shadow-md transition-shadow ${!template.isActive ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {template.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="sm" className="size-7 p-0" />}
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openPreview(template)}>
                        <Eye className="size-4 me-2" />
                        תצוגה מקדימה
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(template)}>
                        <Edit className="size-4 me-2" />
                        עריכה
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(template)}>
                        {template.isActive ? (
                          <>
                            <PowerOff className="size-4 me-2" />
                            השבת
                          </>
                        ) : (
                          <>
                            <Power className="size-4 me-2" />
                            הפעל
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{contractTypeLabels[template.contractType] || template.contractType}</span>
                  <span>•</span>
                  <span>{formatLanguage(template.language)}</span>
                </div>
                {template.industryPack && (
                  <Badge variant="outline" className="text-[10px]">
                    {template.industryPack.name}
                  </Badge>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${template.isActive ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}
                    >
                      {template.isActive ? "פעיל" : "לא פעיל"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {template._count.contracts} חוזים
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(template.createdAt).toLocaleDateString("he-IL")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>תבנית חדשה</DialogTitle>
            <DialogDescription>צור תבנית חוזה חדשה לשימוש חוזר</DialogDescription>
          </DialogHeader>
          <TemplateForm
            formData={formData}
            setFormData={setFormData}
            industryPacks={filterOptions.industryPacks}
            error={error}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? "יוצר..." : "צור תבנית"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>עריכת תבנית</DialogTitle>
            <DialogDescription>עדכן את פרטי התבנית</DialogDescription>
          </DialogHeader>
          <TemplateForm
            formData={formData}
            setFormData={setFormData}
            industryPacks={filterOptions.industryPacks}
            error={error}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleUpdate} disabled={isPending}>
              {isPending ? "שומר..." : "שמור שינויים"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>תצוגה מקדימה של התבנית</DialogDescription>
          </DialogHeader>
          {selectedTemplate && <TemplatePreview template={selectedTemplate} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              סגור
            </Button>
            <Button
              onClick={() => {
                setPreviewOpen(false)
                openEdit(selectedTemplate!)
              }}
            >
              עריכה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function TemplateForm({
  formData,
  setFormData,
  industryPacks,
  error,
}: {
  formData: {
    name: string
    language: string
    contractType: string
    industryPackId: string
    isActive: boolean
    contentSections: string
  }
  setFormData: (data: typeof formData) => void
  industryPacks: IndustryPack[]
  error: string
}) {
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto px-0.5">
      <div className="space-y-2">
        <label className="text-sm font-medium">שם התבנית *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="לדוגמה: הסכם שירותים + SOW"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">סוג חוזה *</label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={formData.contractType}
            onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
          >
            <option value="">בחר סוג...</option>
            {contractTypeOptions.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">שפה</label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          >
            {languageOptions.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">חבילת תעשייה</label>
        <select
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={formData.industryPackId}
          onChange={(e) => setFormData({ ...formData, industryPackId: e.target.value })}
        >
          <option value="">ללא</option>
          {industryPacks.map((ip) => (
            <option key={ip.id} value={ip.id}>
              {ip.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">סעיפי התבנית (שורה לכל סעיף)</label>
        <Textarea
          value={formData.contentSections}
          onChange={(e) => setFormData({ ...formData, contentSections: e.target.value })}
          placeholder={"צדדים להסכם\nהיקף השירותים\nתמורה ותנאי תשלום\nסודיות\nקניין רוחני\nסיום התקשרות"}
          rows={6}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="size-4"
        />
        <span className="text-sm">פעיל</span>
      </label>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}

function TemplatePreview({ template }: { template: SerializedTemplate }) {
  const content = template.content as { title?: string; sections?: string[] }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">סוג חוזה:</span>{" "}
          <span className="font-medium">
            {contractTypeLabels[template.contractType] || template.contractType}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">שפה:</span>{" "}
          <span className="font-medium">{formatLanguage(template.language)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">סטטוס:</span>{" "}
          <Badge
            variant="secondary"
            className={`text-[10px] ${template.isActive ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}
          >
            {template.isActive ? "פעיל" : "לא פעיל"}
          </Badge>
        </div>
        {template.industryPack && (
          <div>
            <span className="text-muted-foreground">תעשייה:</span>{" "}
            <span className="font-medium">{template.industryPack.name}</span>
          </div>
        )}
      </div>

      {content?.sections && content.sections.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">סעיפי התבנית</h4>
          <div className="rounded-md border bg-muted/30 p-3">
            <ol className="space-y-1.5 list-decimal list-inside text-sm">
              {content.sections.map((section, i) => (
                <li key={i} className="text-muted-foreground">
                  {section}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        נוצר בתאריך: {new Date(template.createdAt).toLocaleDateString("he-IL")}
        {" • "}
        {template._count.contracts} חוזים משתמשים בתבנית זו
      </div>
    </div>
  )
}
