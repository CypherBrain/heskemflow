import Link from "next/link"
import { listNotifications } from "@/actions/notifications"
import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle2, Clock, ArrowLeft } from "lucide-react"
import { NotificationActions, GenerateNotificationsButton } from "@/components/notifications/notification-actions"
import { EmptyState } from "@/components/ui/empty-state"

const severityConfig: Record<string, { icon: typeof Info; bg: string; color: string; label: string; strip: string }> = {
  INFO: { icon: Info, bg: "bg-[#DBEAFE]", color: "text-[#2563EB]", label: "מידע", strip: "bg-[#2563EB]" },
  SUCCESS: { icon: CheckCircle2, bg: "bg-[#DCFCE7]", color: "text-[#16A34A]", label: "הצלחה", strip: "bg-[#16A34A]" },
  WARNING: { icon: AlertTriangle, bg: "bg-[#FEF3C7]", color: "text-[#D97706]", label: "אזהרה", strip: "bg-[#D97706]" },
  DANGER: { icon: AlertCircle, bg: "bg-[#FEE2E2]", color: "text-[#DC2626]", label: "חשוב", strip: "bg-[#DC2626]" },
  CRITICAL: { icon: AlertCircle, bg: "bg-[#DC2626]", color: "text-white", label: "קריטי", strip: "bg-[#DC2626]" },
}

export default async function NotificationsPage() {
  const notifications = await listNotifications()
  const unread = notifications.filter((n) => n.status === "UNREAD")
  const read = notifications.filter((n) => n.status === "READ")
  const dismissed = notifications.filter((n) => n.status === "DISMISSED" || n.status === "COMPLETED")

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">מרכז התראות</h1>
          <p className="page-description mt-2">
            התראות חוזיות, חידושים, מועדי ביטול, התחייבויות וסיכוני AI.
          </p>
          {unread.length > 0 && (
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 text-[11px] font-bold rounded-full bg-[#FEE2E2] text-[#DC2626] ring-1 ring-[#FECACA]">
              <span className="size-2 rounded-full bg-[#DC2626] animate-pulse" />
              {unread.length} התראות ממתינות לפעולה
            </span>
          )}
        </div>
        <GenerateNotificationsButton />
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="אין התראות פתוחות כרגע — הכול בשליטה"
          description="לחץ על &quot;בדוק עכשיו&quot; ליצירת התראות אוטומטיות מהתחייבויות ומועדי חידוש"
        />
      ) : (
        <div className="space-y-8">
          {unread.length > 0 && (
            <NotificationSection title="דורש פעולה עכשיו" notifications={unread} />
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
      <h2 className="text-sm font-bold text-[#64748B] mb-3 uppercase tracking-wider">{title} ({notifications.length})</h2>
      <div className="space-y-2.5">
        {notifications.map((notif) => {
          const config = severityConfig[notif.severity] ?? severityConfig.INFO
          const Icon = config.icon
          const isUnread = notif.status === "UNREAD"

          return (
            <div
              key={notif.id}
              className={`premium-card overflow-hidden transition-all duration-200 hover:shadow-[0_24px_50px_rgba(15,23,42,0.08)] ${isUnread ? "" : "opacity-75"}`}
            >
              <div className="flex">
                {/* Severity color strip */}
                <div className={`w-1 shrink-0 ${config.strip}`} />
                <div className="flex-1 p-5">
                  <div className="flex items-start gap-3.5">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                      <Icon className={`size-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-[#0F172A]">{notif.title}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-md ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        {isUnread && (
                          <span className="size-2.5 rounded-full bg-[#2563EB] ring-2 ring-white animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">{notif.message}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-[#94A3B8]">
                        {notif.contract && (
                          <Link href={`/contracts/${notif.contract.id}`} className="hover:text-[#2563EB] font-semibold transition-colors flex items-center gap-1">
                            {notif.contract.title}
                            <ArrowLeft className="size-3" />
                          </Link>
                        )}
                        {notif.department && <span className="font-medium">מחלקה: {notif.department.name}</span>}
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
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
