"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  FileStack,
  BookOpen,
  Building2,
  Bell,
  Users,
  Settings,
  ListChecks,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/contracts", label: "חוזים", icon: FileText },
  { href: "/obligations", label: "התחייבויות", icon: ListChecks },
  { href: "/departments", label: "מחלקות", icon: Building2 },
  { href: "/notifications", label: "התראות", icon: Bell },
  { href: "/presign", label: "טרום-חתימה", icon: GitBranch },
  { href: "/templates", label: "תבניות", icon: FileStack },
  { href: "/clauses", label: "סעיפים", icon: BookOpen },
  { href: "/reminders", label: "תזכורות", icon: Bell },
  { href: "/crm", label: "CRM", icon: Users },
  { href: "/settings", label: "הגדרות", icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex h-full w-[260px] flex-col border-s bg-white",
        className
      )}
    >
      <div className="flex h-16 items-center gap-3 px-5">
        <Link href="/dashboard" className="flex items-center gap-3">
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
        </Link>
      </div>

      <div className="mx-4 h-px bg-[#E2E8F0]" />

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
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

      <div className="mx-4 h-px bg-[#E2E8F0]" />

      <div className="p-4 flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-[#F1F5F9]">
          <span className="text-xs font-bold text-[#64748B]">מ</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#0F172A] truncate">מנהל מערכת</p>
          <p className="text-[10px] text-[#94A3B8] truncate">admin@heskemflow.co.il</p>
        </div>
      </div>
    </aside>
  )
}

export { navItems }
