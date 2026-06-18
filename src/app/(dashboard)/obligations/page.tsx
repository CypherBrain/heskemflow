import Link from "next/link"
import { listAllObligations, getObligationStats } from "@/actions/obligations"
import { listDepartments } from "@/actions/departments"
import { getOrgUsers } from "@/actions/contracts"
import { ListChecks, AlertCircle, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import { PriorityBadge } from "@/components/ui/priority-badge"
import { DepartmentBadge } from "@/components/ui/department-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ObligationFilters, CompleteObligationButton } from "@/components/obligations/obligation-actions"

const statusLabels: Record<string, string> = {
  OPEN: "פתוח",
  IN_PROGRESS: "בתהליך",
  COMPLETED: "הושלם",
  OVERDUE: "באיחור",
}

const statusColors: Record<string, string> = {
  OPEN: "bg-[#F1F5F9] text-[#64748B] ring-[#E2E8F0]",
  IN_PROGRESS: "bg-[#DBEAFE] text-[#2563EB] ring-[#BFDBFE]",
  COMPLETED: "bg-[#DCFCE7] text-[#16A34A] ring-[#BBF7D0]",
  OVERDUE: "bg-[#FEE2E2] text-[#DC2626] ring-[#FECACA]",
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
    <div className="page-shell">
      <div>
        <h1 className="page-title">התחייבויות ופעולות</h1>
        <p className="page-description mt-2">
          כל ההתחייבויות, המועדים והפעולות הנדרשות מתוך החוזים.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={AlertCircle} label="באיחור" value={stats.overdue} iconBg="bg-gradient-to-b from-[#FEE2E2] to-[#FEF2F2]" iconColor="text-[#DC2626]" valueColor="text-[#DC2626]" ring="ring-[#FECACA]" />
        <StatCard icon={Clock} label="השבוע" value={stats.dueThisWeek} iconBg="bg-gradient-to-b from-[#FEF3C7] to-[#FFFBEB]" iconColor="text-[#D97706]" valueColor="text-[#D97706]" ring="ring-[#FDE68A]" />
        <StatCard icon={AlertTriangle} label="פתוחות" value={stats.open} iconBg="bg-gradient-to-b from-[#DBEAFE] to-[#EFF6FF]" iconColor="text-[#2563EB]" valueColor="text-[#2563EB]" ring="ring-[#BFDBFE]" />
        <StatCard icon={CheckCircle2} label="הושלמו" value={stats.completed} iconBg="bg-gradient-to-b from-[#DCFCE7] to-[#F0FDF4]" iconColor="text-[#16A34A]" valueColor="text-[#16A34A]" ring="ring-[#BBF7D0]" />
      </div>

      {/* Filters */}
      <ObligationFilters
        departments={departments.map((d) => ({ id: d.id, name: d.name }))}
        users={users}
        currentFilters={params}
      />

      {/* List */}
      {obligations.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="אין התחייבויות"
          description="לא נמצאו התחייבויות מתאימות למסננים שנבחרו"
        />
      ) : (
        <div className="space-y-2.5">
          {obligations.map((ob) => {
            const isOverdue = ob.dueDate && new Date(ob.dueDate) < new Date() && ob.status !== "COMPLETED"
            const effectiveStatus = isOverdue ? "OVERDUE" : ob.status
            return (
              <div
                key={ob.id}
                className={`premium-card p-5 transition-all duration-200 hover:shadow-[0_24px_50px_rgba(15,23,42,0.08)] ${isOverdue ? "ring-1 ring-[#FECACA]" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-[#0F172A]">{ob.title}</p>
                      <PriorityBadge priority={ob.priority} />
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-lg ring-1 ${statusColors[effectiveStatus] ?? statusColors.OPEN}`}>
                        {statusLabels[effectiveStatus] ?? effectiveStatus}
                      </span>
                    </div>
                    {ob.description && (
                      <p className="text-xs text-[#64748B] line-clamp-1 leading-relaxed">{ob.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-[11px] text-[#94A3B8]">
                      <Link href={`/contracts/${ob.contract.id}`} className="hover:text-[#2563EB] font-semibold transition-colors">
                        {ob.contract.title}
                      </Link>
                      {ob.department && <DepartmentBadge name={ob.department.name} />}
                      {ob.owner && <span className="flex items-center gap-1">אחראי: <strong className="text-[#334155]">{ob.owner.fullName}</strong></span>}
                      <span>סוג: {ob.obligationType}</span>
                      {ob.dueDate && (
                        <span className={`flex items-center gap-1 ${isOverdue ? "text-[#DC2626] font-bold" : ""}`}>
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

function StatCard({ icon: Icon, label, value, iconBg, iconColor, valueColor, ring }: {
  icon: typeof AlertCircle
  label: string
  value: number
  iconBg: string
  iconColor: string
  valueColor: string
  ring: string
}) {
  return (
    <div className={`metric-card p-5 ring-1 ${ring}`}>
      <div className="flex items-center gap-3.5">
        <div className={`flex size-12 items-center justify-center rounded-2xl ${iconBg}`}>
          <Icon className={`size-5 ${iconColor}`} />
        </div>
        <div>
          <p className={`text-2xl font-extrabold tracking-tight ${valueColor}`}>{value}</p>
          <p className="text-[11px] text-[#94A3B8] font-bold">{label}</p>
        </div>
      </div>
    </div>
  )
}
