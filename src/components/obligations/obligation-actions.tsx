"use client"

import { useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { completeObligation } from "@/actions/obligations"
import { Check, Loader2, Filter, X } from "lucide-react"

const selectClass =
  "flex h-9 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs shadow-none outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"

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
      className="rounded-xl gap-1.5 text-xs h-9 border-[#E2E8F0] hover:border-[#BBF7D0] hover:bg-[#F0FDF4] transition-all duration-200"
    >
      {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5 text-[#16A34A]" />}
      סמן כהושלם
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
    <div className="flex flex-wrap items-center gap-2.5 premium-card p-4">
      <div className="flex size-8 items-center justify-center rounded-xl bg-[#F1F5F9]">
        <Filter className="size-4 text-[#94A3B8]" />
      </div>
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
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-9 rounded-xl text-[#DC2626] hover:bg-[#FEE2E2] gap-1 transition-all duration-200">
          <X className="size-3" />
          נקה מסננים
        </Button>
      )}
    </div>
  )
}
