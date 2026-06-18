import Link from "next/link"
import { listNotifications, generateDueNotifications } from "@/actions/notifications"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle2, Clock } from "lucide-react"
import { NotificationActions, GenerateNotificationsButton } from "@/components/notifications/notification-actions"

const severityConfig: Record<string, { icon: typeof Info; color: string; label: string }> = {
  INFO: { icon: Info, color: "bg-[#DBEAFE] text-[#2563EB]", label: "מידע" },
  SUCCESS: { icon: CheckCircle2, color: "bg-[#DCFCE7] text-[#16A34A]", label: "הצלחה" },
  WARNING: { icon: AlertTriangle, color: "bg-[#FEF3C7] text-[#D97706]", label: "אזהרה" },
  DANGER: { icon: AlertCircle, color: "bg-[#FEE2E2] text-[#DC2626]", label: "חשוב" },
  CRITICAL: { icon: AlertCircle, color: "bg-[#DC2626] text-white", label: "קריטי" },
}

export default async function NotificationsPage() {
  const notifications = await listNotifications()
  const unread = notifications.filter((n) => n.status === "UNREAD")
  const read = notifications.filter((n) => n.status === "READ")
  const dismissed = notifications.filter((n) => n.status === "DISMISSED" || n.status === "COMPLETED")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">התראות</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{unread.length} התראות שלא נקראו</p>
        </div>
        <GenerateNotificationsButton />
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-[#E2E8F0] bg-white">
          <Bell className="size-12 text-[#CBD5E1] mb-3" />
          <p className="text-sm text-[#94A3B8] font-medium">אין התראות</p>
          <p className="text-xs text-[#CBD5E1] mt-1">לחץ על &quot;בדוק עכשיו&quot; ליצירת התראות אוטומטיות</p>
        </div>
      ) : (
        <div className="space-y-6">
          {unread.length > 0 && (
            <NotificationSection title="דורש פעולה" notifications={unread} />
          )}
          {read.length > 0 && (
            <NotificationSection title="נקראו" notifications={read} />
          )}
          {dismissed.length > 0 && (
            <NotificationSection title="הושלם / נדחה" notifications={dismissed} />
          )}
        </div>
      )}
    </div>
  )
}

function NotificationSection({ title, notifications }: {
  title: string
  notifications: Awaited<ReturnType<typeof listNotifications>>
}) {
  return (
    <div>
      <h2 className="text-sm font-bold text-[#64748B] mb-3">{title} ({notifications.length})</h2>
      <div className="space-y-2">
        {notifications.map((notif) => {
          const config = severityConfig[notif.severity] ?? severityConfig.INFO
          const Icon = config.icon

          return (
            <div
              key={notif.id}
              className={`rounded-xl border p-4 transition-colors ${
                notif.status === "UNREAD"
                  ? "bg-white border-[#E2E8F0] shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                  : "bg-[#F8FAFC] border-[#E2E8F0]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-[#0F172A]">{notif.title}</p>
                    <Badge className={`text-[9px] font-bold rounded-md ${config.color}`}>
                      {config.label}
                    </Badge>
                    {notif.status === "UNREAD" && (
                      <span className="size-2 rounded-full bg-[#2563EB]" />
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{notif.message}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#94A3B8]">
                    {notif.contract && (
                      <Link href={`/contracts/${notif.contract.id}`} className="hover:text-[#2563EB] font-medium">
                        {notif.contract.title}
                      </Link>
                    )}
                    {notif.department && <span>מחלקה: {notif.department.name}</span>}
                    {notif.user && <span>אחראי: {notif.user.fullName}</span>}
                    {notif.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(notif.dueDate).toLocaleDateString("he-IL")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <NotificationActions notificationId={notif.id} status={notif.status} actionUrl={notif.actionUrl} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
