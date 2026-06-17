import { getIndustryPacks } from "@/actions/industries"
import { Badge } from "@/components/ui/badge"
import { FileText, Package, Layers } from "lucide-react"

export default async function IndustriesPage() {
  const packs = await getIndustryPacks()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">חבילות תעשייתיות</h1>
        <p className="page-description mt-1">
          תבניות וסעיפים מותאמים לפי תעשייה — מוכנים לשימוש מיידי
        </p>
      </div>

      {packs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white py-16 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-[#EDE9FE] mb-4">
            <Package className="size-7 text-[#7C3AED]" />
          </div>
          <p className="text-base font-bold text-[#0F172A] mb-1">אין חבילות תעשייתיות עדיין</p>
          <p className="text-sm text-[#64748B]">חבילות ייוספו בקרוב — הישאר מעודכן</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="group flex flex-col rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
            >
              <div className="border-b border-[#E2E8F0] px-5 pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FE]">
                    <Layers className="size-5 text-[#7C3AED]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#0F172A] truncate">{pack.name}</h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5 font-mono">{pack.slug}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                {pack.description && (
                  <p className="text-[13px] leading-relaxed text-[#64748B]">{pack.description}</p>
                )}

                <div className="flex items-center gap-1.5 text-sm text-[#334155]">
                  <FileText className="size-3.5 text-[#64748B]" />
                  <span className="font-semibold">{pack.templates.length}</span>
                  <span className="text-[#64748B]">תבניות</span>
                </div>

                {pack.templates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pack.templates.map((t) => (
                      <Badge
                        key={t.id}
                        variant="outline"
                        className="text-[10px] font-medium border-[#E2E8F0] text-[#334155] bg-slate-50/50"
                      >
                        {t.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
