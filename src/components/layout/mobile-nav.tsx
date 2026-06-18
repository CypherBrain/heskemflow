"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Shield } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { navItems } from "@/components/layout/sidebar"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center justify-center rounded-xl size-9 hover:bg-[#F1F5F9] transition-colors md:hidden">
        <Menu className="size-5 text-[#64748B]" />
        <span className="sr-only">תפריט</span>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0 bg-gradient-to-b from-white via-white to-[#FAFBFE]">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white text-sm font-bold shadow-lg shadow-blue-500/20">
                HF
              </div>
              <div>
                <span className="text-[15px] font-extrabold tracking-tight text-[#0F172A]">
                  HeskemFlow
                </span>
                <p className="text-[10px] text-[#94A3B8] font-medium -mt-0.5 tracking-wide">
                  CRM Contract Automation
                </p>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mx-5 mt-4 h-px bg-gradient-to-l from-transparent via-[#E2E8F0] to-transparent" />

        <nav className="flex-1 space-y-0.5 px-4 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#DBEAFE] text-[#2563EB] shadow-sm border-s-[3px] border-[#2563EB]"
                    : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155]"
                )}
              >
                <Icon className={cn("size-[18px] shrink-0", isActive ? "text-[#2563EB]" : "text-[#94A3B8]")} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User card */}
        <div className="mx-5 h-px bg-gradient-to-l from-transparent via-[#E2E8F0] to-transparent" />
        <div className="p-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] p-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white">
              <span className="text-xs font-bold">מנ</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#0F172A] truncate">מנהל מערכת</p>
              <p className="text-[10px] text-[#94A3B8] truncate">admin@heskemflow.co.il</p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-bold text-[#2563EB]">
              <Shield className="size-2.5" />
              Demo
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
