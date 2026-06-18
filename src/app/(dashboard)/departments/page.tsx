import { listDepartments } from "@/actions/departments"
import { getOrgUsers } from "@/actions/contracts"
import { Building2, Users, AlertTriangle, CheckCircle2, Shield } from "lucide-react"
import { CreateDepartmentButton, AssignUserButton } from "@/components/departments/department-actions"
import { EmptyState } from "@/components/ui/empty-state"

const deptAccentColors: Record<string, { bg: string; icon: string; ring: string }> = {
  "משפטי": { bg: "bg-[#EDE9FE]", icon: "text-[#7C3AED]", ring: "ring-[#DDD6FE]" },
  "כספים": { bg: "bg-[#DCFCE7]", icon: "text-[#16A34A]", ring: "ring-[#BBF7D0]" },
  "מכירות": { bg: "bg-[#DBEAFE]", icon: "text-[#2563EB]", ring: "ring-[#BFDBFE]" },
  "תפעול": { bg: "bg-[#FEF3C7]", icon: "text-[#D97706]", ring: "ring-[#FDE68A]" },
  "HR": { bg: "bg-[#FCE7F3]", icon: "text-[#DB2777]", ring: "ring-[#FBCFE8]" },
  "IT": { bg: "bg-[#E0E7FF]", icon: "text-[#4F46E5]", ring: "ring-[#C7D2FE]" },
  "הנהלה": { bg: "bg-[#F1F5F9]", icon: "text-[#0F172A]", ring: "ring-[#E2E8F0]" },
}
const defaultAccent = { bg: "bg-[#DBEAFE]", icon: "text-[#2563EB]", ring: "ring-[#BFDBFE]" }

export default async function DepartmentsPage() {
  const [departments, users] = await Promise.all([
    listDepartments(),
    getOrgUsers(),
  ])

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">מחלקות ואחריות</h1>
          <p className="page-description mt-2">
            הגדרת צוותים, אחראים ותחומי אחריות לכל סוג חוזה והתחייבות.
          </p>
        </div>
        <CreateDepartmentButton users={users} />
      </div>

      {departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="אין מחלקות עדיין"
          description="צור מחלקה ראשונה כדי להתחיל לשייך אחריות לצוותים"
          actionLabel="צור מחלקה"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const accent = deptAccentColors[dept.name] ?? defaultAccent
            return (
              <div
                key={dept.id}
                className="premium-card p-6 hover:shadow-[0_24px_50px_rgba(15,23,42,0.08)] transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-11 items-center justify-center rounded-2xl ${accent.bg} ring-1 ${accent.ring}`}>
                      <Building2 className={`size-5 ${accent.icon}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">{dept.name}</h3>
                      {dept.manager && (
                        <p className="text-[11px] text-[#94A3B8]">מנהל: {dept.manager.fullName}</p>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-lg ring-1 ${dept.isActive ? "bg-[#DCFCE7] text-[#16A34A] ring-[#BBF7D0]" : "bg-[#F1F5F9] text-[#94A3B8] ring-[#E2E8F0]"}`}>
                    {dept.isActive ? (
                      <><CheckCircle2 className="size-2.5" />פעיל</>
                    ) : "לא פעיל"}
                  </span>
                </div>

                {dept.description && (
                  <p className="text-xs text-[#64748B] mb-4 line-clamp-2 leading-relaxed">{dept.description}</p>
                )}

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="rounded-xl bg-[#F8FAFC] p-3 text-center ring-1 ring-[#E2E8F0]/50">
                    <Users className="size-4 text-[#64748B] mx-auto mb-1" />
                    <p className="text-lg font-extrabold text-[#0F172A]">{dept._count.users}</p>
                    <p className="text-[10px] text-[#94A3B8] font-bold">משתמשים</p>
                  </div>
                  <div className="rounded-xl bg-[#FFFBEB] p-3 text-center ring-1 ring-[#FDE68A]/50">
                    <AlertTriangle className="size-4 text-[#D97706] mx-auto mb-1" />
                    <p className="text-lg font-extrabold text-[#0F172A]">{dept._count.obligations}</p>
                    <p className="text-[10px] text-[#94A3B8] font-bold">התחייבויות</p>
                  </div>
                  <div className="rounded-xl bg-[#FEF2F2] p-3 text-center ring-1 ring-[#FECACA]/50">
                    <Shield className="size-4 text-[#DC2626] mx-auto mb-1" />
                    <p className="text-lg font-extrabold text-[#0F172A]">{dept._count.notifications}</p>
                    <p className="text-[10px] text-[#94A3B8] font-bold">התראות</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#E2E8F0]/80">
                  <AssignUserButton departmentId={dept.id} departmentName={dept.name} users={users} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
