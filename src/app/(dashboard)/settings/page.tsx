"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Bell, Plug, Crown, FileSignature, BarChart3, HardDrive, Sparkles } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="page-title">הגדרות</h1>
        <p className="page-description mt-1">ניהול הגדרות הארגון, התראות ואינטגרציות</p>
      </div>

      <section className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#DBEAFE]">
            <Building2 className="size-4 text-[#2563EB]" />
          </div>
          <h2 className="text-base font-bold text-[#0F172A]">פרטי ארגון</h2>
        </div>
        <div className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#334155]">שם הארגון</label>
              <Input defaultValue="חסקם טכנולוגיות" className="rounded-xl border-[#E2E8F0] focus-visible:ring-[#2563EB]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#334155]">דומיין</label>
              <Input defaultValue="heskem.co.il" className="rounded-xl border-[#E2E8F0] focus-visible:ring-[#2563EB]" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#334155]">שפה</label>
              <Select defaultValue="he">
                <SelectTrigger className="rounded-xl border-[#E2E8F0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="he">עברית</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#334155]">מטבע ברירת מחדל</label>
              <Select defaultValue="ILS">
                <SelectTrigger className="rounded-xl border-[#E2E8F0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ILS">₪ שקל חדש</SelectItem>
                  <SelectItem value="USD">$ דולר</SelectItem>
                  <SelectItem value="EUR">€ אירו</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] font-semibold shadow-sm">
            שמור שינויים
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50">
            <Bell className="size-4 text-amber-600" />
          </div>
          <h2 className="text-base font-bold text-[#0F172A]">התראות</h2>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          <NotifRow
            label="תזכורות חידוש חוזה"
            description="קבל התראה לפני תפוגת חוזה"
            defaultChecked
          />
          <NotifRow
            label="אישורים פנימיים"
            description="התראה כשחוזה ממתין לאישורך"
            defaultChecked
          />
          <NotifRow
            label="הערות חדשות"
            description="התראה כשמישהו מגיב על חוזה שלך"
            defaultChecked={false}
          />
          <NotifRow
            label="עדכוני חתימה"
            description="התראה כשלקוח חותם או מסרב"
            defaultChecked
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#EDE9FE]">
            <Plug className="size-4 text-[#7C3AED]" />
          </div>
          <h2 className="text-base font-bold text-[#0F172A]">אינטגרציות</h2>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          <IntegrationRow
            name="חתימה אלקטרונית"
            provider="DocuSign / Comii Sign"
            connected={false}
            icon={FileSignature}
            iconBg="bg-[#DBEAFE]"
            iconColor="text-[#2563EB]"
          />
          <IntegrationRow
            name="CRM"
            provider="HubSpot / Monday.com"
            connected={false}
            icon={BarChart3}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <IntegrationRow
            name="אחסון קבצים"
            provider="AWS S3 / Cloudflare R2"
            connected={false}
            icon={HardDrive}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <IntegrationRow
            name="בדיקת AI"
            provider="OpenAI / Claude"
            connected={false}
            icon={Sparkles}
            iconBg="bg-[#EDE9FE]"
            iconColor="text-[#7C3AED]"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#DBEAFE] to-[#EDE9FE]">
            <Crown className="size-4 text-[#7C3AED]" />
          </div>
          <h2 className="text-base font-bold text-[#0F172A]">תוכנית</h2>
        </div>
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-bold text-[#0F172A]">Enterprise</p>
            <p className="text-xs text-[#64748B] mt-0.5">חוזים ללא הגבלה, כל האינטגרציות</p>
          </div>
          <Badge className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-semibold px-3">
            פעיל
          </Badge>
        </div>
      </section>
    </div>
  )
}

function NotifRow({
  label,
  description,
  defaultChecked,
}: {
  label: string
  description: string
  defaultChecked: boolean
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="text-sm font-semibold text-[#0F172A]">{label}</p>
        <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}

function IntegrationRow({
  name,
  provider,
  connected,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  name: string
  provider: string
  connected: boolean
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className={`flex size-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`size-4 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">{name}</p>
          <p className="text-xs text-[#64748B] mt-0.5">{provider}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className={`rounded-xl text-xs font-semibold ${
          connected
            ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            : "border-[#E2E8F0] text-[#334155] hover:bg-slate-50"
        }`}
      >
        {connected ? "מחובר" : "חבר"}
      </Button>
    </div>
  )
}
