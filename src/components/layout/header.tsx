"use client"

import Link from "next/link"
import { Bell, Search, Plus, ListChecks, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MobileNav } from "@/components/layout/mobile-nav"
import { useEffect, useState } from "react"

export function Header() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/notifications/count")
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.count ?? 0)
        }
      } catch {
        // silent fail
      }
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#E2E8F0]/80 bg-white/70 backdrop-blur-xl px-4 md:px-8">
      <MobileNav />

      {/* Search */}
      <div className="relative hidden md:block md:w-96">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
        <Input
          type="search"
          placeholder="חיפוש חוזים, חברות, התחייבויות..."
          className="h-10 ps-10 bg-[#F8FAFC] border-[#E2E8F0] rounded-xl text-sm placeholder:text-[#94A3B8] focus:bg-white transition-colors"
        />
      </div>

      <div className="ms-auto flex items-center gap-2">
        {/* Demo chip */}
        <span className="hidden lg:inline-flex items-center gap-1.5 rounded-lg bg-[#EDE9FE] px-2.5 py-1 text-[11px] font-bold text-[#7C3AED]">
          <Shield className="size-3" />
          Private Demo
        </span>

        {/* Quick actions */}
        <Link href="/contracts/new">
          <Button size="sm" className="rounded-xl gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] font-semibold shadow-md shadow-blue-500/15 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20">
            <Plus className="size-4" />
            <span className="hidden sm:inline">חוזה חדש</span>
          </Button>
        </Link>

        <Link href="/obligations">
          <Button variant="outline" size="sm" className="hidden md:inline-flex rounded-xl gap-2 border-[#E2E8F0] text-[#64748B] hover:text-[#2563EB] hover:border-[#DBEAFE] hover:bg-[#F8FAFC] font-medium transition-all duration-200">
            <ListChecks className="size-4" />
            <span>התחייבויות</span>
          </Button>
        </Link>

        {/* Notifications */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-[#F1F5F9] transition-all duration-200">
            <Bell className="size-[18px] text-[#64748B]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 flex size-[18px] items-center justify-center rounded-full bg-[#DC2626] text-[9px] text-white font-bold ring-2 ring-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>

        {/* User avatar */}
        <div className="flex items-center justify-center size-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white shadow-md shadow-blue-500/15">
          <span className="text-xs font-bold">מנ</span>
        </div>
      </div>
    </header>
  )
}
