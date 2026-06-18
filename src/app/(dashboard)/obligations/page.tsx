import { listAllObligations, getObligationStats } from "@/actions/obligations"
import { listDepartments } from "@/actions/departments"
import { getOrgUsers } from "@/actions/contracts"
import { Badge } from "@/components/ui/badge"
import { ListChecks, AlertCircle, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { ObligationFilters, CompleteObligationButton } from "@/components/obligations/obligation-actions"

const priorityColors: Record<string, string> = {
  LOW: "bg-[#F1F5F9] text-[#64748B]",
  MEDIUM: "bg-[#DBEAFE] text-[#2563EB]",
  HIGH: "bg-[#FEF3C7] text-[#D97706]",
  CRITICAL: "bg-[#FEE2E2] text-[#DC2626]",
}

const priorityLabels: Record<string, string> = {
  LOW: "נמוך",
  MEDIUM: "בינוני",
  HIGH: "גבוה",
  CRITICAL: "קריטי",
}

const statusLabels: Record<string, string> = {
  OPEN: "פתוח",
  IN_PROGRESS: "בתהליך",
  COMPLETED: "הושלם",
  OVERDUE: "באיחור",
}

const statusColors: Record<string, string> = {
  OPEN: "bg-[#F1F5F9] text-[#64748B]",
  IN_PROGRESS: "bg-[#DBEAFE] text-[#2563EB]",
  COMPLETED: "bg-[#DCFCE7] text-[#16A34A]",
  OVERDUE: "bg-[#FEE2E2] text-[#DC2626]",
}

export default async function ObligationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const [obligations, stats, departments, users] = await Promise.all([
    listAllObligations({
      status: params.status,
      departmentId: params.department,
      ownerId: params.owner,
      priority: params.priority,
    }),
    getObligationStats(),
    listDepartments(),
    getOrgUsers(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">התחייבויות</h1>
        <p className="text-sm text-[#94A3B8] mt-1">ניהול ומעקב אחר כל ההתחייבויות החוזיות</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={AlertCircle} label="באיחור" value={stats.overdue} color="text-[#DC2626]" bg="bg-[#FEE2E2]" />
        <StatCard icon={Clock} label="השבוע" value={stats.dueThisWeek} color="text-[#D97706]" bg="bg-[#FEF3C7]" />
        <StatCard icon={AlertTriangle} label="פתוחות" value={stats.open} color="text-[#2563EB]" bg="bg-[#DBEAFE]" />
        <StatCard icon={CheckCircle2} label="הושלמו" value={stats.completed} color="text-[#16A34A]" bg="bg-[#DCFCE7]" />
      </div>

      {/* Filters */}
      <ObligationFilters
        departments={departments.map((d) => ({ id: d.id, name: d.name }))}
        users={users}
        currentFilters={params}
      />

      {/* List */}
      {obligations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-[#E2E8F0] bg-white">
          <ListChecks className="size-12 text-[#CBD5E1] mb-3" />
          <p className="text-sm text-[#94A3B8] font-medium">אין התחייבויות</p>
        </div>
      ) : (
        <div className="space-y-2">
          {obligations.map((ob) => {
            const isOverdue = ob.dueDate && new Date(ob.dueDate) < new Date() && ob.status !== "COMPLETED"
            return (
              <div
                key={ob.id}
                className={`rounded-xl border p-4 bg-white transition-colors ${isOverdue ? "border-red-200" : "border-[#E2E8F0]"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-[#0F172A]">{ob.title}</p>
                      <Badge className={`text-[10px] font-bold rounded-lg ${priorityColors[ob.priority]}`}>
                        {priorityLabels[ob.priority]}
                      </Badge>
                      <Badge className={`text-[10px] font-bold rounded-lg ${isOverdue ? statusColors.OVERDUE : statusColors[ob.status]}`}>
                        {isOverdue ? "באיחור" : statusLabels[ob.status]}
                      </Badge>
                    </div>
                    {ob.description && (
                      <p className="text-xs text-[#64748B] line-clamp-1">{ob.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-[11px] text-[#94A3B8]">
                      <Link href={`/contracts/${ob.contract.id}`} className="hover:text-[#2563EB] font-medium">
                        {ob.contract.title}
                      </Link>
                      {ob.department && <span>מחלקה: {ob.department.name}</span>}
                      {ob.owner && <span>אחראי: {ob.owner.fullName}</span>}
                      <span>סוג: {ob.obligationType}</span>
                      {ob.dueDate && (
                        <span className={`flex items-center gap-1 ${isOverdue ? "text-[#DC2626] font-semibold" : ""}`}>
                          <Clock className="size-3" />
                          {new Date(ob.dueDate).toLocaleDateString("he-IL")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {ob.status !== "COMPLETED" && (
                      <CompleteObligationButton obligationId={ob.id} />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: typeof AlertCircle
  label: string
  value: number
  color: string
  bg: string
}) {
  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-xl ${bg}`}>
          <Icon className={`size-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-[#0F172A]">{value}</p>
          <p className="text-xs text-[#94A3B8] font-medium">{label}</p>
        </div>
      </div>
    </div>
  )
}
