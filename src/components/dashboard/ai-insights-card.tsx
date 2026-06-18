"use client"

import Link from "next/link"
import { Brain, ShieldAlert, Sparkles, SearchCheck, ListChecks, Lightbulb, Calendar, ArrowLeft } from "lucide-react"

interface AiInsight {
  id: string
  reviewType: string
  riskScore: number | null
  summary: string | null
  createdAt: string
  contract: { id: string; title: string }
}

const reviewTypeConfig: Record<string, { label: string; icon: typeof Brain; bg: string; color: string }> = {
  summary: { label: "סיכום", icon: Sparkles, bg: "bg-[#DBEAFE]", color: "text-[#2563EB]" },
  risk: { label: "סיכונים", icon: ShieldAlert, bg: "bg-[#FEE2E2]", color: "text-[#DC2626]" },
  missing_clauses: { label: "סעיפים חסרים", icon: SearchCheck, bg: "bg-[#FEF3C7]", color: "text-[#D97706]" },
  obligations: { label: "התחייבויות", icon: ListChecks, bg: "bg-[#DCFCE7]", color: "text-[#16A34A]" },
  suggestions: { label: "הצעות", icon: Lightbulb, bg: "bg-[#EDE9FE]", color: "text-[#7C3AED]" },
}

export function DashboardAiInsights({ insights }: { insights: AiInsight[] }) {
  return (
    <div className="premium-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]/80">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] shadow-lg shadow-violet-500/15">
            <Brain className="size-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">תובנות AI אחרונות</h3>
            <p className="text-[11px] text-[#94A3B8]">ניתוחים אוטומטיים מבוססי בינה מלאכותית</p>
          </div>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F1F5F9] mx-auto mb-4">
            <Brain className="size-7 text-[#CBD5E1]" />
          </div>
          <p className="text-sm font-semibold text-[#334155]">עדיין לא בוצע ניתוח AI</p>
          <p className="text-xs text-[#94A3B8] mt-1.5">פתח חוזה ולחץ על "בינה חוזית" להתחלה</p>
        </div>
      ) : (
        <div className="divide-y divide-[#E2E8F0]/80">
          {insights.map((insight) => {
            const config = reviewTypeConfig[insight.reviewType] ?? {
              label: insight.reviewType,
              icon: Brain,
              bg: "bg-[#F1F5F9]",
              color: "text-[#64748B]",
            }
            const Icon = config.icon

            return (
              <Link
                key={insight.id}
                href={`/contracts/${insight.contract.id}`}
                className="flex items-center gap-3.5 px-6 py-4 hover:bg-[#F8FAFC] transition-all duration-200 group"
              >
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                  <Icon className={`size-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">{insight.contract.title}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-md ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                    {insight.riskScore !== null && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-md ${
                          insight.riskScore <= 30
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : insight.riskScore <= 60
                              ? "bg-[#FEF3C7] text-[#D97706]"
                              : "bg-[#FEE2E2] text-[#DC2626]"
                        }`}
                      >
                        {insight.riskScore}/100
                      </span>
                    )}
                  </div>
                  {insight.summary && (
                    <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">{insight.summary}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] shrink-0">
                  <Calendar className="size-3" />
                  <span>{new Date(insight.createdAt).toLocaleDateString("he-IL")}</span>
                </div>
                <ArrowLeft className="size-4 text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
