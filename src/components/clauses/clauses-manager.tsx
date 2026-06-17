"use client"

import { useState, useTransition } from "react"
import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Trash2,
  Copy,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { createClause, updateClause, deleteClause } from "@/actions/clauses"

interface SerializedClause {
  id: string
  title: string
  content: string
  category: string
  riskLevel: string
  language: string
  industry: string | null
  createdAt: string
}

interface FilterOptions {
  categories: string[]
  riskLevels: string[]
  languages: string[]
  industries: string[]
}

const riskColors: Record<string, string> = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-green-50 text-green-700",
}

const riskLabels: Record<string, string> = {
  high: "סיכון גבוה",
  medium: "סיכון בינוני",
  low: "סיכון נמוך",
}

const riskOptions = [
  { value: "low", label: "סיכון נמוך" },
  { value: "medium", label: "סיכון בינוני" },
  { value: "high", label: "סיכון גבוה" },
]

const languageOptions = [
  { value: "he", label: "עברית" },
  { value: "en", label: "English" },
  { value: "ar", label: "ערבית" },
]

const categoryPresets = [
  "Payment",
  "Confidentiality",
  "Liability",
  "Termination",
  "IP Rights",
  "Non-Compete",
  "Force Majeure",
  "Dispute Resolution",
  "Warranty",
  "Indemnification",
]

function formatLanguage(lang: string) {
  return languageOptions.find((l) => l.value === lang)?.label ?? lang
}

export function ClausesManager({
  clauses: initialClauses,
  filterOptions,
}: {
  clauses: SerializedClause[]
  filterOptions: FilterOptions
}) {
  const [isPending, startTransition] = useTransition()
  const [clauses] = useState(initialClauses)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterRisk, setFilterRisk] = useState("all")
  const [filterLang, setFilterLang] = useState("all")
  const [filterIndustry, setFilterIndustry] = useState("all")

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedClause, setSelectedClause] = useState<SerializedClause | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    language: "he",
    riskLevel: "medium",
    content: "",
    industry: "",
  })

  const [error, setError] = useState("")

  const filtered = clauses.filter((c) => {
    if (filterCategory !== "all" && c.category !== filterCategory) return false
    if (filterRisk !== "all" && c.riskLevel !== filterRisk) return false
    if (filterLang !== "all" && c.language !== filterLang) return false
    if (filterIndustry !== "all" && c.industry !== filterIndustry) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        c.title.toLowerCase().includes(s) ||
        c.content.toLowerCase().includes(s) ||
        c.category.toLowerCase().includes(s)
      )
    }
    return true
  })

  function resetForm() {
    setFormData({
      title: "",
      category: "",
      language: "he",
      riskLevel: "medium",
      content: "",
      industry: "",
    })
    setError("")
  }

  function openCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function openEdit(c: SerializedClause) {
    setSelectedClause(c)
    setFormData({
      title: c.title,
      category: c.category,
      language: c.language,
      riskLevel: c.riskLevel,
      content: c.content,
      industry: c.industry || "",
    })
    setError("")
    setEditOpen(true)
  }

  function openDelete(c: SerializedClause) {
    setSelectedClause(c)
    setDeleteOpen(true)
  }

  function handleCopy(content: string) {
    navigator.clipboard.writeText(content)
  }

  function handleCreate() {
    if (!formData.title || !formData.category || !formData.content) {
      setError("כותרת, קטגוריה ותוכן הם שדות חובה")
      return
    }

    startTransition(async () => {
      try {
        await createClause({
          title: formData.title,
          category: formData.category,
          language: formData.language,
          riskLevel: formData.riskLevel,
          content: formData.content,
          industry: formData.industry || undefined,
        })
        setCreateOpen(false)
        resetForm()
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה ביצירת הסעיף")
      }
    })
  }

  function handleUpdate() {
    if (!selectedClause) return
    if (!formData.title || !formData.category || !formData.content) {
      setError("כותרת, קטגוריה ותוכן הם שדות חובה")
      return
    }

    startTransition(async () => {
      try {
        await updateClause(selectedClause.id, {
          title: formData.title,
          category: formData.category,
          language: formData.language,
          riskLevel: formData.riskLevel,
          content: formData.content,
          industry: formData.industry || null,
        })
        setEditOpen(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה בעדכון הסעיף")
      }
    })
  }

  function handleDelete() {
    if (!selectedClause) return

    startTransition(async () => {
      try {
        await deleteClause(selectedClause.id)
        setDeleteOpen(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה במחיקת הסעיף")
      }
    })
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="חיפוש סעיף..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          סעיף חדש
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-md border bg-background px-3 py-1.5 text-xs"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">כל הקטגוריות</option>
          {filterOptions.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border bg-background px-3 py-1.5 text-xs"
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
        >
          <option value="all">כל רמות הסיכון</option>
          {filterOptions.riskLevels.map((r) => (
            <option key={r} value={r}>
              {riskLabels[r] || r}
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

        {filterOptions.industries.length > 0 && (
          <select
            className="rounded-md border bg-background px-3 py-1.5 text-xs"
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
          >
            <option value="all">כל התעשיות</option>
            {filterOptions.industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <BookOpen className="size-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {clauses.length === 0 ? "אין סעיפים עדיין" : "לא נמצאו סעיפים"}
          </p>
          {clauses.length === 0 && (
            <Button variant="outline" className="mt-3" onClick={openCreate}>
              צור סעיף ראשון
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((clause) => (
            <Card key={clause.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {clause.title}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="sm" className="size-7 p-0" />}
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(clause)}>
                        <Edit className="size-4 me-2" />
                        עריכה
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopy(clause.content)}>
                        <Copy className="size-4 me-2" />
                        העתק תוכן
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openDelete(clause)}
                        className="text-red-600"
                      >
                        <Trash2 className="size-4 me-2" />
                        מחק
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {clause.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">
                      {clause.category}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${riskColors[clause.riskLevel] ?? ""}`}
                    >
                      {riskLabels[clause.riskLevel] ?? clause.riskLevel}
                    </Badge>
                    {clause.industry && (
                      <Badge variant="outline" className="text-[10px]">
                        {clause.industry}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{formatLanguage(clause.language)}</span>
                  <span>{new Date(clause.createdAt).toLocaleDateString("he-IL")}</span>
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
            <DialogTitle>סעיף חדש</DialogTitle>
            <DialogDescription>צור סעיף חוזה חדש לספרייה</DialogDescription>
          </DialogHeader>
          <ClauseForm
            formData={formData}
            setFormData={setFormData}
            error={error}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? "יוצר..." : "צור סעיף"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>עריכת סעיף</DialogTitle>
            <DialogDescription>עדכן את פרטי הסעיף</DialogDescription>
          </DialogHeader>
          <ClauseForm
            formData={formData}
            setFormData={setFormData}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>מחיקת סעיף</DialogTitle>
            <DialogDescription>
              האם למחוק את הסעיף &quot;{selectedClause?.title}&quot;? פעולה זו
              אינה ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "מוחק..." : "מחק סעיף"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ClauseForm({
  formData,
  setFormData,
  error,
}: {
  formData: {
    title: string
    category: string
    language: string
    riskLevel: string
    content: string
    industry: string
  }
  setFormData: (data: typeof formData) => void
  error: string
}) {
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto px-0.5">
      <div className="space-y-2">
        <label className="text-sm font-medium">כותרת *</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="לדוגמה: סעיף סודיות"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">קטגוריה *</label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">בחר קטגוריה...</option>
            {categoryPresets.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">רמת סיכון *</label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={formData.riskLevel}
            onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
          >
            {riskOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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

        <div className="space-y-2">
          <label className="text-sm font-medium">תעשייה</label>
          <Input
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            placeholder="אופציונלי"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">תוכן הסעיף *</label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="הכנס את תוכן הסעיף..."
          rows={6}
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
