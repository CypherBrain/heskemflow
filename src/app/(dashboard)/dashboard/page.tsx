import Link from "next/link"
import { getDashboardStats, getRecentContracts, getContractStatusBreakdown, getUpcomingRenewals } from "@/actions/dashboard"
import { DashboardStats } from "@/components/dashboard/stats-cards"
import { DashboardRecentContracts } from "@/components/dashboard/recent-contracts"
import { DashboardStatusChart } from "@/components/dashboard/contract-status-chart"
import { DashboardRenewals } from "@/components/dashboard/upcoming-reminders"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"

export default async function DashboardPage() {
  const [stats, recentContracts, statusBreakdown, renewals] = await Promise.all([
    getDashboardStats(),
    getRecentContracts(),
    getContractStatusBreakdown(),
    getUpcomingRenewals(),
  ])

  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0F172A] via-[#1E3A5F] to-[#2563EB] p-8 md:p-10 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -start-20 size-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-10 -end-10 size-48 rounded-full bg-[#7C3AED]/30 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm">עברית + English</span>
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm">Pre-Sign Workflow</span>
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm">MySQL + Prisma</span>
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm">CRM Ready</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mb-3">
            ניהול חוזים חכם שמתחבר ל-CRM שלך
          </h1>
          <p className="text-sm md:text-base text-white/80 leading-relaxed mb-6 max-w-xl">
            יוצרים חוזים מתוך עסקאות, מנהלים אישורים לפני חתימה, שומרים את ההסכם החתום ומקבלים תזכורות לחידוש, תשלומים והתחייבויות.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contracts/new">
              <Button size="lg" className="rounded-xl bg-white text-[#2563EB] hover:bg-white/90 font-bold shadow-md gap-2">
                <Plus className="size-4" />
                יצירת חוזה
              </Button>
            </Link>
            <Link href="/contracts">
              <Button size="lg" variant="outline" className="rounded-xl border-white/30 text-white hover:bg-white/10 font-semibold gap-2">
                צפייה בחוזים
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardRecentContracts contracts={recentContracts} />
        </div>
        <div>
          <DashboardStatusChart data={statusBreakdown} />
        </div>
      </div>

      <DashboardRenewals contracts={renewals} />
    </div>
  )
}
