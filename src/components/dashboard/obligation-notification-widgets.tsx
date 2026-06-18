"use client"

import Link from "next/link"
import { AlertCircle, Clock, Bell, ListChecks, ArrowLeft } from "lucide-react"

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

const severityConfig: Record<string, { dot: string; bg: string }> = {
  INFO: { dot: "bg-[#2563EB]", bg: "bg-[#DBEAFE]" },
  SUCCESS: { dot: "bg-[#16A34A]", bg: "bg-[#DCFCE7]" },
  WARNING: { dot: "bg-[#D97706]", bg: "bg-[#FEF3C7]" },
  DANGER: { dot: "bg-[#DC2626]", bg: "bg-[#FEE2E2]" },
  CRITICAL: { dot: "bg-[#DC2626]", bg: "bg-[#FEE2E2]" },
}

export function DashboardObligationWidget({ stats }: { stats: ObligationWidgetData }) {
  return (
    <div className="premium-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-[#DBEAFE]">
            <ListChecks className="size-4 text-[#2563EB]" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">התחייבויות</h3>
        </div>
        <Link href="/obligations" className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold flex items-center gap-1 transition-colors">
          הכל
          <ArrowLeft className="size-3" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gradient-to-b from-[#FEE2E2] to-[#FEF2F2] p-4 text-center ring-1 ring-[#FECACA]">
          <AlertCircle className="size-5 text-[#DC2626] mx-auto mb-1.5" />
          <p className="text-2xl font-extrabold text-[#DC2626]">{stats.overdue}</p>
          <p className="text-[10px] text-[#DC2626]/70 font-bold">באיחור</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-b from-[#FEF3C7] to-[#FFFBEB] p-4 text-center ring-1 ring-[#FDE68A]">
          <Clock className="size-5 text-[#D97706] mx-auto mb-1.5" />
          <p className="text-2xl font-extrabold text-[#D97706]">{stats.dueThisWeek}</p>
          <p className="text-[10px] text-[#D97706]/70 font-bold">השבוע</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-b from-[#DBEAFE] to-[#EFF6FF] p-4 text-center ring-1 ring-[#BFDBFE]">
          <ListChecks className="size-5 text-[#2563EB] mx-auto mb-1.5" />
          <p className="text-2xl font-extrabold text-[#2563EB]">{stats.open}</p>
          <p className="text-[10px] text-[#2563EB]/70 font-bold">פתוחות</p>
        </div>
      </div>
    </div>
  )
}

export function DashboardNotificationWidget({ notifications }: { notifications: NotificationWidgetItem[] }) {
  return (
    <div className="premium-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]/80">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-[#FEF3C7]">
            <Bell className="size-4 text-[#D97706]" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">התראות אחרונות</h3>
        </div>
        <Link href="/notifications" className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold flex items-center gap-1 transition-colors">
          הכל
          <ArrowLeft className="size-3" />
        </Link>
      </div>
      {notifications.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <Bell className="size-10 text-[#E2E8F0] mx-auto mb-3" />
          <p className="text-sm text-[#94A3B8] font-medium">אין התראות פתוחות כרגע — הכול בשליטה</p>
        </div>
      ) : (
        <div className="p-3 space-y-1">
          {notifications.map((n) => {
            const config = severityConfig[n.severity] ?? severityConfig.INFO
            return (
              <Link
                key={n.id}
                href={n.contractId ? `/contracts/${n.contractId}` : "/notifications"}
                className="flex items-start gap-3 rounded-xl p-3 hover:bg-[#F8FAFC] transition-all duration-200 group"
              >
                <div className="mt-1.5 shrink-0">
                  <span className={`block size-2.5 rounded-full ${config.dot} ring-2 ring-white`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">{n.title}</p>
                  {n.contractTitle && (
                    <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">{n.contractTitle}</p>
                  )}
                </div>
                <ArrowLeft className="size-3.5 text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors shrink-0 mt-1" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
