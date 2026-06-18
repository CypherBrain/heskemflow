"use client"

import Link from "next/link"
import { Brain, ShieldAlert, Sparkles, SearchCheck, ListChecks, Lightbulb, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AiInsight {
  id: string
  reviewType: string
  riskScore: number | null
  summary: string | null
  createdAt: string
  contract: { id: string; title: string }
}

const reviewTypeConfig: Record<string, { label: string; icon: typeof Brain; color: string }> = {
  summary: { label: "סיכום", icon: Sparkles, color: "bg-[#DBEAFE] text-[#2563EB]" },
  risk: { label: "סיכונים", icon: ShieldAlert, color: "bg-[#FEE2E2] text-[#DC2626]" },
  missing_clauses: { label: "סעיפים חסרים", icon: SearchCheck, color: "bg-[#FEF3C7] text-[#D97706]" },
  obligations: { label: "התחייבויות", icon: ListChecks, color: "bg-[#DCFCE7] text-[#16A34A]" },
  suggestions: { label: "הצעות", icon: Lightbulb, color: "bg-[#EDE9FE] text-[#7C3AED]" },
}

export function DashboardAiInsights({ insights }: { insights: AiInsight[] }) {
  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#E2E8F0]">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB]">
          <Brain className="size-4 text-white" />
        </div>
        <h3 className="text-sm font-bold text-[#0F172A]">תובנות AI אחרונות</h3>
      </div>

      {insights.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <Brain className="size-10 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-sm text-[#94A3B8] font-medium">עדיין לא בוצע ניתוח AI</p>
          <p className="text-xs text-[#CBD5E1] mt-1">פתח חוזה ולחץ על "בינה חוזית" להתחלה</p>
        </div>
      ) : (
        <div className="divide-y divide-[#E2E8F0]">
          {insights.map((insight) => {
            const config = reviewTypeConfig[insight.reviewType] ?? {
              label: insight.reviewType,
              icon: Brain,
              color: "bg-[#F1F5F9] text-[#64748B]",
            }
            const Icon = config.icon

            return (
              <Link
                key={insight.id}
                href={`/contracts/${insight.contract.id}`}
                className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#F8FAFC] transition-colors"
              >
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">{insight.contract.title}</p>
                    <Badge className={`text-[9px] font-bold rounded-md shrink-0 ${config.color}`}>
                      {config.label}
                    </Badge>
                    {insight.riskScore !== null && (
                      <Badge
                        className={`text-[9px] font-bold rounded-md shrink-0 ${
                          insight.riskScore <= 30
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : insight.riskScore <= 60
                              ? "bg-[#FEF3C7] text-[#D97706]"
                              : "bg-[#FEE2E2] text-[#DC2626]"
                        }`}
                      >
                        {insight.riskScore}
                      </Badge>
                    )}
                  </div>
                  {insight.summary && (
                    <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">{insight.summary}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#94A3B8] shrink-0">
                  <Calendar className="size-3" />
                  <span>{new Date(insight.createdAt).toLocaleDateString("he-IL")}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
