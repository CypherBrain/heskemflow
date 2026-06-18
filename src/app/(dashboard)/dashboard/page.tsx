import Link from "next/link"
import { getDashboardStats, getRecentContracts, getContractStatusBreakdown, getUpcomingRenewals } from "@/actions/dashboard"
import { getLatestAiInsights } from "@/actions/ai-review"
import { getObligationStats } from "@/actions/obligations"
import { listNotifications, getAiActionNotifications } from "@/actions/notifications"
import { DashboardStats } from "@/components/dashboard/stats-cards"
import { DashboardRecentContracts } from "@/components/dashboard/recent-contracts"
import { DashboardStatusChart } from "@/components/dashboard/contract-status-chart"
import { DashboardRenewals } from "@/components/dashboard/upcoming-reminders"
import { DashboardAiInsights } from "@/components/dashboard/ai-insights-card"
import { DashboardObligationWidget, DashboardNotificationWidget } from "@/components/dashboard/obligation-notification-widgets"
import { DashboardAiActionsWidget } from "@/components/dashboard/ai-actions-widget"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft, Zap, Database, Brain, GitBranch } from "lucide-react"

export default async function DashboardPage() {
  const [stats, recentContracts, statusBreakdown, renewals, aiInsights, obligationStats, recentNotifications, aiActions] = await Promise.all([
    getDashboardStats(),
    getRecentContracts(),
    getContractStatusBreakdown(),
    getUpcomingRenewals(),
    getLatestAiInsights(),
    getObligationStats(),
    listNotifications("UNREAD"),
    getAiActionNotifications(),
  ])

  const nextAction = recentNotifications[0] ?? null

  return (
    <div className="page-shell">
      {/* Hero */}
      <div className="gradient-hero p-8 md:p-10 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ring-1 ring-white/10">
                <Database className="size-3" />
                MySQL + Prisma
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ring-1 ring-white/10">
                <Brain className="size-3" />
                AI Contract Intelligence
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ring-1 ring-white/10">
                <GitBranch className="size-3" />
                Pre-Sign Workflow
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mb-2">
              לוח בקרה לניהול חוזים
            </h1>
            <p className="text-sm md:text-[15px] text-white/70 leading-relaxed max-w-lg">
              מעקב אחר חוזים, התחייבויות, חידושים, סיכונים ופעולות שדורשות טיפול.
            </p>
          </div>

          {/* Next action panel */}
          {nextAction && (
            <div className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5 min-w-[280px]">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="size-4 text-amber-300" />
                <p className="text-xs font-bold text-white/90 uppercase tracking-wider">פעולה הבאה</p>
              </div>
              <p className="text-sm font-semibold text-white mb-1 line-clamp-2">{nextAction.title}</p>
              {nextAction.contract?.title && (
                <p className="text-xs text-white/50 mb-3">{nextAction.contract.title}</p>
              )}
              <Link href={nextAction.contract?.id ? `/contracts/${nextAction.contract.id}` : "/notifications"}>
                <Button size="sm" className="rounded-xl bg-white text-[#2563EB] hover:bg-white/90 font-bold shadow-md gap-2 w-full">
                  פתח פעולה
                  <ArrowLeft className="size-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <DashboardStats stats={stats} overdueObligations={obligationStats.overdue} />

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardRecentContracts contracts={recentContracts} />
        </div>
        <div className="space-y-6">
          <DashboardStatusChart data={statusBreakdown} />
          <DashboardObligationWidget stats={obligationStats} />
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardNotificationWidget
          notifications={recentNotifications.slice(0, 5).map((n) => ({
            id: n.id,
            title: n.title,
            severity: n.severity,
            type: n.type,
            contractTitle: n.contract?.title ?? null,
            contractId: n.contract?.id ?? null,
            createdAt: n.createdAt,
          }))}
        />
        <DashboardAiActionsWidget
          items={aiActions.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            severity: n.severity,
            contractTitle: n.contract?.title ?? null,
            contractId: n.contract?.id ?? null,
          }))}
        />
        <DashboardRenewals contracts={renewals} />
      </div>

      {/* AI insights full width */}
      <DashboardAiInsights insights={aiInsights} />
    </div>
  )
}
