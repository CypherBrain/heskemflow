"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { markNotificationRead, dismissNotification, completeNotification, generateDueNotifications } from "@/actions/notifications"
import { Check, X, Eye, RefreshCw, Loader2 } from "lucide-react"

export function NotificationActions({
  notificationId,
  status,
  actionUrl,
}: {
  notificationId: string
  status: string
  actionUrl: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleRead() {
    startTransition(async () => {
      await markNotificationRead(notificationId)
    })
  }

  function handleDismiss() {
    startTransition(async () => {
      await dismissNotification(notificationId)
    })
  }

  function handleComplete() {
    startTransition(async () => {
      await completeNotification(notificationId)
    })
  }

  function handleNavigate() {
    if (actionUrl) router.push(actionUrl)
  }

  if (status === "DISMISSED" || status === "COMPLETED") return null

  return (
    <div className="flex gap-1">
      {status === "UNREAD" && (
        <Button variant="ghost" size="icon" onClick={handleRead} disabled={isPending} className="size-7 rounded-lg">
          <Eye className="size-3.5 text-[#64748B]" />
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={handleComplete} disabled={isPending} className="size-7 rounded-lg">
        <Check className="size-3.5 text-[#16A34A]" />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleDismiss} disabled={isPending} className="size-7 rounded-lg">
        <X className="size-3.5 text-[#94A3B8]" />
      </Button>
      {actionUrl && (
        <Button variant="ghost" size="sm" onClick={handleNavigate} className="text-[10px] h-7 rounded-lg text-[#2563EB]">
          פתח
        </Button>
      )}
    </div>
  )
}

export function GenerateNotificationsButton() {
  const [isPending, startTransition] = useTransition()

  function handleGenerate() {
    startTransition(async () => {
      await generateDueNotifications()
    })
  }

  return (
    <Button onClick={handleGenerate} disabled={isPending} size="sm" variant="outline" className="rounded-xl gap-2">
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
      בדוק עכשיו
    </Button>
  )
}
