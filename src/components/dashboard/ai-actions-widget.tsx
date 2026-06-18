"use client"

import Link from "next/link"
import { ShieldAlert, SearchCheck, Brain, ArrowLeft } from "lucide-react"

interface AiActionItem {
  id: string
  type: string
  title: string
  severity: string
  contractTitle: string | null
  contractId: string | null
}

const typeConfig: Record<string, { icon: typeof Brain; bg: string; color: string; label: string }> = {
  AI_RISK_FOUND: { icon: ShieldAlert, bg: "bg-[#FEE2E2]", color: "text-[#DC2626]", label: "סיכון" },
  MISSING_CLAUSE: { icon: SearchCheck, bg: "bg-[#FEF3C7]", color: "text-[#D97706]", label: "סעיף חסר" },
}

export function DashboardAiActionsWidget({ items }: { items: AiActionItem[] }) {
  return (
    <div className="premium-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]/80">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#EDE9FE] to-[#DBEAFE]">
            <Brain className="size-4 text-[#7C3AED]" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">פעולות AI נדרשות</h3>
        </div>
        <Link href="/notifications" className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold flex items-center gap-1 transition-colors">
          הכל
          <ArrowLeft className="size-3" />
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F1F5F9] mx-auto mb-4">
            <Brain className="size-7 text-[#CBD5E1]" />
          </div>
          <p className="text-sm font-semibold text-[#334155]">אין פעולות AI ממתינות</p>
          <p className="text-xs text-[#94A3B8] mt-1">כל הממצאים טופלו</p>
        </div>
      ) : (
        <div className="p-3 space-y-1">
          {items.map((item) => {
            const config = typeConfig[item.type] ?? typeConfig.AI_RISK_FOUND
            const Icon = config.icon
            return (
              <Link
                key={item.id}
                href={item.contractId ? `/contracts/${item.contractId}` : "/notifications"}
                className="flex items-center gap-3 rounded-xl p-3 hover:bg-[#F8FAFC] transition-all duration-200 group"
              >
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                  <Icon className={`size-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">{item.title}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-md shrink-0 ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  {item.contractTitle && (
                    <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">{item.contractTitle}</p>
                  )}
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
