"use client"

import Link from "next/link"
import { ShieldAlert, SearchCheck, Brain, ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AiActionItem {
  id: string
  type: string
  title: string
  severity: string
  contractTitle: string | null
  contractId: string | null
}

const typeConfig: Record<string, { icon: typeof Brain; color: string; label: string }> = {
  AI_RISK_FOUND: { icon: ShieldAlert, color: "bg-[#FEE2E2] text-[#DC2626]", label: "סיכון" },
  MISSING_CLAUSE: { icon: SearchCheck, color: "bg-[#FEF3C7] text-[#D97706]", label: "סעיף חסר" },
}

export function DashboardAiActionsWidget({ items }: { items: AiActionItem[] }) {
  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="size-4 text-[#7C3AED]" />
          <h3 className="text-sm font-bold text-[#0F172A]">פעולות AI נדרשות</h3>
        </div>
        <Link href="/notifications" className="text-xs text-[#2563EB] hover:underline font-medium flex items-center gap-1">
          הכל
          <ChevronLeft className="size-3" />
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-4">
          <Brain className="size-8 text-[#CBD5E1] mx-auto mb-2" />
          <p className="text-sm text-[#94A3B8]">אין פעולות AI ממתינות</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const config = typeConfig[item.type] ?? typeConfig.AI_RISK_FOUND
            const Icon = config.icon
            return (
              <Link
                key={item.id}
                href={item.contractId ? `/contracts/${item.contractId}` : "/notifications"}
                className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-[#F8FAFC] transition-colors"
              >
                <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                  <Icon className="size-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-[#0F172A] truncate">{item.title}</p>
                    <Badge className={`text-[9px] font-bold rounded-md shrink-0 ${config.color}`}>
                      {config.label}
                    </Badge>
                  </div>
                  {item.contractTitle && (
                    <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">{item.contractTitle}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
