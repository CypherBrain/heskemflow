"use client"

import Link from "next/link"
import { AlertCircle, Clock, Bell, ListChecks, ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ObligationWidgetData {
  overdue: number
  dueThisWeek: number
  open: number
}

interface NotificationWidgetItem {
  id: string
  title: string
  severity: string
  type: string
  contractTitle: string | null
  contractId: string | null
  createdAt: string
}

export function DashboardObligationWidget({ stats }: { stats: ObligationWidgetData }) {
  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListChecks className="size-4 text-[#2563EB]" />
          <h3 className="text-sm font-bold text-[#0F172A]">התחייבויות</h3>
        </div>
        <Link href="/obligations" className="text-xs text-[#2563EB] hover:underline font-medium flex items-center gap-1">
          הכל
          <ChevronLeft className="size-3" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#FEE2E2] p-3 text-center">
          <AlertCircle className="size-4 text-[#DC2626] mx-auto mb-1" />
          <p className="text-xl font-extrabold text-[#DC2626]">{stats.overdue}</p>
          <p className="text-[10px] text-[#DC2626]/70 font-medium">באיחור</p>
        </div>
        <div className="rounded-xl bg-[#FEF3C7] p-3 text-center">
          <Clock className="size-4 text-[#D97706] mx-auto mb-1" />
          <p className="text-xl font-extrabold text-[#D97706]">{stats.dueThisWeek}</p>
          <p className="text-[10px] text-[#D97706]/70 font-medium">השבוע</p>
        </div>
        <div className="rounded-xl bg-[#DBEAFE] p-3 text-center">
          <ListChecks className="size-4 text-[#2563EB] mx-auto mb-1" />
          <p className="text-xl font-extrabold text-[#2563EB]">{stats.open}</p>
          <p className="text-[10px] text-[#2563EB]/70 font-medium">פתוחות</p>
        </div>
      </div>
    </div>
  )
}

const severityColors: Record<string, string> = {
  INFO: "bg-[#DBEAFE] text-[#2563EB]",
  SUCCESS: "bg-[#DCFCE7] text-[#16A34A]",
  WARNING: "bg-[#FEF3C7] text-[#D97706]",
  DANGER: "bg-[#FEE2E2] text-[#DC2626]",
  CRITICAL: "bg-[#DC2626] text-white",
}

export function DashboardNotificationWidget({ notifications }: { notifications: NotificationWidgetItem[] }) {
  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-[#D97706]" />
          <h3 className="text-sm font-bold text-[#0F172A]">התראות אחרונות</h3>
        </div>
        <Link href="/notifications" className="text-xs text-[#2563EB] hover:underline font-medium flex items-center gap-1">
          הכל
          <ChevronLeft className="size-3" />
        </Link>
      </div>
      {notifications.length === 0 ? (
        <p className="text-sm text-[#94A3B8] text-center py-4">אין התראות</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-2 rounded-lg p-2 hover:bg-[#F8FAFC] transition-colors">
              <Badge className={`text-[9px] shrink-0 rounded-md font-bold mt-0.5 ${severityColors[n.severity] ?? severityColors.INFO}`}>
                {n.severity === "CRITICAL" ? "!" : n.severity === "DANGER" ? "!!" : "i"}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0F172A] truncate">{n.title}</p>
                {n.contractTitle && n.contractId && (
                  <Link href={`/contracts/${n.contractId}`} className="text-[10px] text-[#2563EB] hover:underline">
                    {n.contractTitle}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
