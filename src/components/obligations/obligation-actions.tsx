"use client"

import { useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { completeObligation } from "@/actions/obligations"
import { Check, Loader2, Filter } from "lucide-react"

const selectClass =
  "flex h-8 rounded-lg border border-[#E2E8F0] bg-white px-2 text-xs shadow-none outline-none focus:ring-1 focus:ring-[#2563EB]"

export function CompleteObligationButton({ obligationId }: { obligationId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleComplete() {
    startTransition(async () => {
      await completeObligation(obligationId)
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleComplete}
      disabled={isPending}
      className="rounded-lg gap-1.5 text-xs h-8"
    >
      {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5 text-[#16A34A]" />}
      השלם
    </Button>
  )
}

export function ObligationFilters({
  departments,
  users,
  currentFilters,
}: {
  departments: { id: string; name: string }[]
  users: { id: string; fullName: string }[]
  currentFilters: Record<string, string | undefined>
}) {
  const router = useRouter()
  const pathname = usePathname()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(currentFilters)) {
      if (v && k !== key) params.set(k, v)
    }
    if (value && value !== "all") params.set(key, value)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function clearFilters() {
    router.push(pathname)
  }

  const hasFilters = Object.values(currentFilters).some((v) => v)

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white border border-[#E2E8F0] p-3">
      <Filter className="size-4 text-[#94A3B8]" />
      <select
        value={currentFilters.status ?? "all"}
        onChange={(e) => updateFilter("status", e.target.value)}
        className={selectClass}
      >
        <option value="all">כל הסטטוסים</option>
        <option value="OPEN">פתוח</option>
        <option value="IN_PROGRESS">בתהליך</option>
        <option value="COMPLETED">הושלם</option>
        <option value="OVERDUE">באיחור</option>
      </select>
      <select
        value={currentFilters.priority ?? "all"}
        onChange={(e) => updateFilter("priority", e.target.value)}
        className={selectClass}
      >
        <option value="all">כל העדיפויות</option>
        <option value="CRITICAL">קריטי</option>
        <option value="HIGH">גבוה</option>
        <option value="MEDIUM">בינוני</option>
        <option value="LOW">נמוך</option>
      </select>
      <select
        value={currentFilters.department ?? "all"}
        onChange={(e) => updateFilter("department", e.target.value)}
        className={selectClass}
      >
        <option value="all">כל המחלקות</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <select
        value={currentFilters.owner ?? "all"}
        onChange={(e) => updateFilter("owner", e.target.value)}
        className={selectClass}
      >
        <option value="all">כל האחראים</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.fullName}</option>
        ))}
      </select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8 rounded-lg text-[#94A3B8]">
          נקה
        </Button>
      )}
    </div>
  )
}
