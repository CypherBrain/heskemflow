import { listDepartments } from "@/actions/departments"
import { getOrgUsers } from "@/actions/contracts"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, AlertTriangle, CheckCircle2 } from "lucide-react"
import { CreateDepartmentButton, AssignUserButton } from "@/components/departments/department-actions"

export default async function DepartmentsPage() {
  const [departments, users] = await Promise.all([
    listDepartments(),
    getOrgUsers(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">מחלקות</h1>
          <p className="text-sm text-[#94A3B8] mt-1">ניהול מחלקות, משתמשים והתחייבויות</p>
        </div>
        <CreateDepartmentButton users={users} />
      </div>

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-[#E2E8F0] bg-white">
          <Building2 className="size-12 text-[#CBD5E1] mb-3" />
          <p className="text-sm text-[#94A3B8] font-medium">אין מחלקות עדיין</p>
          <p className="text-xs text-[#CBD5E1] mt-1">צור מחלקה ראשונה להתחיל</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-[#DBEAFE]">
                    <Building2 className="size-4 text-[#2563EB]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{dept.name}</h3>
                    {dept.manager && (
                      <p className="text-[11px] text-[#94A3B8]">מנהל: {dept.manager.fullName}</p>
                    )}
                  </div>
                </div>
                <Badge className={`text-[10px] font-bold rounded-lg ${dept.isActive ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>
                  {dept.isActive ? "פעיל" : "לא פעיל"}
                </Badge>
              </div>

              {dept.description && (
                <p className="text-xs text-[#64748B] mb-3 line-clamp-2">{dept.description}</p>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-[#F8FAFC] p-2 text-center">
                  <Users className="size-3.5 text-[#64748B] mx-auto mb-1" />
                  <p className="text-lg font-bold text-[#0F172A]">{dept._count.users}</p>
                  <p className="text-[10px] text-[#94A3B8]">משתמשים</p>
                </div>
                <div className="rounded-lg bg-[#F8FAFC] p-2 text-center">
                  <AlertTriangle className="size-3.5 text-[#D97706] mx-auto mb-1" />
                  <p className="text-lg font-bold text-[#0F172A]">{dept._count.obligations}</p>
                  <p className="text-[10px] text-[#94A3B8]">התחייבויות</p>
                </div>
                <div className="rounded-lg bg-[#F8FAFC] p-2 text-center">
                  <CheckCircle2 className="size-3.5 text-[#DC2626] mx-auto mb-1" />
                  <p className="text-lg font-bold text-[#0F172A]">{dept._count.notifications}</p>
                  <p className="text-[10px] text-[#94A3B8]">התראות</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
                <AssignUserButton departmentId={dept.id} departmentName={dept.name} users={users} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
