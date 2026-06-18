"use client"

import Link from "next/link"
import { Bell, Search, Plus, User } from "lucide-react"
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
    <header className="flex h-16 items-center gap-4 border-b border-[#E2E8F0] bg-white/80 backdrop-blur-sm px-4 md:px-8">
      <MobileNav />

      <div className="relative hidden md:block md:w-80">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
        <Input
          type="search"
          placeholder="חיפוש חוזים, חברות, תבניות..."
          className="h-10 ps-10 bg-[#F6F8FB] border-[#E2E8F0] rounded-xl text-sm placeholder:text-[#94A3B8] focus:bg-white"
        />
      </div>

      <div className="ms-auto flex items-center gap-3">
        <Link href="/contracts/new">
          <Button size="sm" className="rounded-xl gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] font-semibold shadow-sm">
            <Plus className="size-4" />
            <span className="hidden sm:inline">חוזה חדש</span>
          </Button>
        </Link>

        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-[#F1F5F9]">
            <Bell className="size-[18px] text-[#64748B]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 flex size-4 items-center justify-center rounded-full bg-[#DC2626] text-[9px] text-white font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>

        <div className="flex items-center justify-center size-8 rounded-lg bg-[#2563EB] text-white">
          <User className="size-4" />
        </div>
      </div>
    </header>
  )
}
