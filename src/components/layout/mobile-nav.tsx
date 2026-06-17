"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
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
      <SheetContent side="right" className="w-[280px] p-0 bg-white">
        <SheetHeader className="px-5 pt-5">
          <SheetTitle>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white text-sm font-bold shadow-md">
                HF
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-[#0F172A]">
                  HeskemFlow
                </span>
                <p className="text-[10px] text-[#94A3B8] font-medium -mt-0.5">
                  CRM Contract Automation
                </p>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mx-4 mt-3 h-px bg-[#E2E8F0]" />

        <nav className="flex-1 space-y-1 px-3 py-4">
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
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#DBEAFE] text-[#2563EB] shadow-sm"
                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#334155]"
                )}
              >
                <Icon className={cn("size-[18px] shrink-0", isActive ? "text-[#2563EB]" : "")} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
