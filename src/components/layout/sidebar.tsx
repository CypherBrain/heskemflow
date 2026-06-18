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
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavSection {
  label: string
  items: { href: string; label: string; icon: typeof LayoutDashboard }[]
}

const navSections: NavSection[] = [
  {
    label: "ניהול",
    items: [
      { href: "/dashboard", label: "לוח בקרה", icon: LayoutDashboard },
      { href: "/contracts", label: "חוזים", icon: FileText },
      { href: "/crm", label: "CRM", icon: Users },
    ],
  },
  {
    label: "תפעול",
    items: [
      { href: "/obligations", label: "התחייבויות", icon: ListChecks },
      { href: "/departments", label: "מחלקות", icon: Building2 },
      { href: "/notifications", label: "התראות", icon: Bell },
      { href: "/presign", label: "טרום-חתימה", icon: GitBranch },
    ],
  },
  {
    label: "מערכת",
    items: [
      { href: "/templates", label: "תבניות", icon: FileStack },
      { href: "/clauses", label: "סעיפים", icon: BookOpen },
      { href: "/reminders", label: "תזכורות", icon: Bell },
      { href: "/settings", label: "הגדרות", icon: Settings },
    ],
  },
]

const navItems = navSections.flatMap((s) => s.items)

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex h-full w-[280px] flex-col border-s border-[#E2E8F0]/80",
        "bg-gradient-to-b from-white via-white to-[#FAFBFE]",
        className
      )}
    >
      {/* Brand block */}
      <div className="flex items-center gap-3 px-6 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
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
        </Link>
      </div>

      <div className="mx-5 h-px bg-gradient-to-l from-transparent via-[#E2E8F0] to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-5 h-px bg-gradient-to-l from-transparent via-[#E2E8F0] to-transparent" />

      {/* User card */}
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

      {/* Footer */}
      <div className="px-6 pb-4">
        <p className="text-[10px] text-[#CBD5E1] text-center font-medium">
          HeskemFlow Private Demo
        </p>
      </div>
    </aside>
  )
}

export { navItems }
