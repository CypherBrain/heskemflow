"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { serializePrisma } from "@/lib/serialize"
import type { NotificationStatus } from "@prisma/client"

export async function listNotifications(statusFilter?: string) {
  const { organizationId } = await getCurrentUser()

  const where: Record<string, unknown> = { organizationId }
  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter as NotificationStatus
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: 100,
    include: {
      contract: { select: { id: true, title: true } },
      obligation: { select: { id: true, title: true } },
      user: { select: { id: true, fullName: true } },
      department: { select: { id: true, name: true } },
    },
  })

  return serializePrisma(notifications) as unknown as SerializedNotification[]
}

export interface SerializedNotification {
  id: string
  type: string
  title: string
  message: string
  severity: string
  status: string
  actionUrl: string | null
  dueDate: string | null
  createdAt: string
  readAt: string | null
  dismissedAt: string | null
  contract: { id: string; title: string } | null
  obligation: { id: string; title: string } | null
  user: { id: string; fullName: string } | null
  department: { id: string; name: string } | null
}

export async function getAiActionNotifications() {
  const { organizationId } = await getCurrentUser()
  const notifications = await prisma.notification.findMany({
    where: {
      organizationId,
      type: { in: ["AI_RISK_FOUND", "MISSING_CLAUSE"] },
      status: { in: ["UNREAD", "READ"] },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      contract: { select: { id: true, title: true } },
    },
  })
  return serializePrisma(notifications) as unknown as SerializedNotification[]
}

export async function getUnreadCount() {
  const { organizationId } = await getCurrentUser()
  return prisma.notification.count({
    where: { organizationId, status: "UNREAD" },
  })
}

export async function markNotificationRead(id: string) {
  await prisma.notification.update({
    where: { id },
    data: { status: "READ", readAt: new Date() },
  })
  revalidatePath("/notifications")
}

export async function dismissNotification(id: string) {
  await prisma.notification.update({
    where: { id },
    data: { status: "DISMISSED", dismissedAt: new Date() },
  })
  revalidatePath("/notifications")
}

export async function completeNotification(id: string) {
  await prisma.notification.update({
    where: { id },
    data: { status: "COMPLETED" },
  })
  revalidatePath("/notifications")
}

export async function generateDueNotifications() {
  const { organizationId } = await getCurrentUser()
  const now = new Date()
  let created = 0

  const contracts = await prisma.contract.findMany({
    where: {
      organizationId,
      status: { notIn: ["EXPIRED", "TERMINATED"] },
    },
    select: {
      id: true,
      title: true,
      renewalDate: true,
      cancellationNoticeDays: true,
      status: true,
    },
  })

  for (const contract of contracts) {
    // Renewal notifications
    if (contract.renewalDate) {
      const daysUntilRenewal = Math.ceil(
        (contract.renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      for (const threshold of [30, 14, 7]) {
        if (daysUntilRenewal <= threshold && daysUntilRenewal > 0) {
          const exists = await prisma.notification.count({
            where: {
              organizationId,
              contractId: contract.id,
              type: "CONTRACT_RENEWAL",
              status: { in: ["UNREAD", "READ"] },
            },
          })
          if (exists === 0) {
            await prisma.notification.create({
              data: {
                organizationId,
                contractId: contract.id,
                type: "CONTRACT_RENEWAL",
                title: "חידוש חוזה מתקרב",
                message: `החוזה "${contract.title}" עומד להתחדש בעוד ${daysUntilRenewal} ימים.`,
                severity: daysUntilRenewal <= 7 ? "DANGER" : "WARNING",
                actionUrl: `/contracts/${contract.id}`,
                dueDate: contract.renewalDate,
              },
            })
            created++
          }
          break
        }
      }

      // Cancellation notice
      if (contract.cancellationNoticeDays) {
        const noticeDeadline = new Date(
          contract.renewalDate.getTime() - contract.cancellationNoticeDays * 24 * 60 * 60 * 1000
        )
        const daysUntilNotice = Math.ceil(
          (noticeDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysUntilNotice <= 30 && daysUntilNotice > 0) {
          const exists = await prisma.notification.count({
            where: {
              organizationId,
              contractId: contract.id,
              type: "CANCELLATION_NOTICE",
              status: { in: ["UNREAD", "READ"] },
            },
          })
          if (exists === 0) {
            await prisma.notification.create({
              data: {
                organizationId,
                contractId: contract.id,
                type: "CANCELLATION_NOTICE",
                title: "מועד הודעת ביטול מתקרב",
                message: `מועד אחרון להודעת ביטול עבור "${contract.title}" בעוד ${daysUntilNotice} ימים.`,
                severity: "DANGER",
                actionUrl: `/contracts/${contract.id}`,
                dueDate: noticeDeadline,
              },
            })
            created++
          }
        }
      }
    }

    // Status-based
    if (["INTERNAL_REVIEW", "LEGAL_REVIEW"].includes(contract.status)) {
      const exists = await prisma.notification.count({
        where: {
          organizationId,
          contractId: contract.id,
          type: "APPROVAL_REQUIRED",
          status: { in: ["UNREAD", "READ"] },
        },
      })
      if (exists === 0) {
        await prisma.notification.create({
          data: {
            organizationId,
            contractId: contract.id,
            type: "APPROVAL_REQUIRED",
            title: "נדרש אישור",
            message: `החוזה "${contract.title}" ממתין לאישור (${contract.status === "INTERNAL_REVIEW" ? "בדיקה פנימית" : "בדיקה משפטית"}).`,
            severity: "WARNING",
            actionUrl: `/contracts/${contract.id}`,
          },
        })
        created++
      }
    }

    if (contract.status === "SENT_FOR_SIGNATURE") {
      const exists = await prisma.notification.count({
        where: {
          organizationId,
          contractId: contract.id,
          type: "SIGNATURE_PENDING",
          status: { in: ["UNREAD", "READ"] },
        },
      })
      if (exists === 0) {
        await prisma.notification.create({
          data: {
            organizationId,
            contractId: contract.id,
            type: "SIGNATURE_PENDING",
            title: "ממתין לחתימה",
            message: `החוזה "${contract.title}" נשלח לחתימה וטרם נחתם.`,
            severity: "INFO",
            actionUrl: `/contracts/${contract.id}`,
          },
        })
        created++
      }
    }
  }

  // Obligation notifications
  const obligations = await prisma.contractObligation.findMany({
    where: {
      contract: { organizationId },
      status: { in: ["OPEN", "IN_PROGRESS"] },
      dueDate: { not: null },
    },
    include: {
      contract: { select: { id: true, title: true } },
    },
  })

  for (const ob of obligations) {
    if (!ob.dueDate) continue
    const daysUntilDue = Math.ceil(
      (ob.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    const notifyDays = ob.notifyBeforeDays ?? 7

    if (daysUntilDue < 0) {
      // Overdue
      const exists = await prisma.notification.count({
        where: {
          organizationId,
          obligationId: ob.id,
          type: "OBLIGATION_DUE",
          severity: "CRITICAL",
          status: { in: ["UNREAD", "READ"] },
        },
      })
      if (exists === 0) {
        await prisma.notification.create({
          data: {
            organizationId,
            contractId: ob.contractId,
            obligationId: ob.id,
            userId: ob.ownerId,
            departmentId: ob.departmentId,
            type: "OBLIGATION_DUE",
            title: "התחייבות באיחור",
            message: `"${ob.title}" (${ob.contract.title}) באיחור של ${Math.abs(daysUntilDue)} ימים.`,
            severity: "CRITICAL",
            actionUrl: `/contracts/${ob.contractId}`,
            dueDate: ob.dueDate,
          },
        })
        created++
      }
    } else if (daysUntilDue <= notifyDays) {
      const exists = await prisma.notification.count({
        where: {
          organizationId,
          obligationId: ob.id,
          type: "OBLIGATION_DUE",
          severity: { not: "CRITICAL" },
          status: { in: ["UNREAD", "READ"] },
        },
      })
      if (exists === 0) {
        const sev = ob.priority === "CRITICAL" ? "DANGER" as const : ob.priority === "HIGH" ? "WARNING" as const : "INFO" as const
        await prisma.notification.create({
          data: {
            organizationId,
            contractId: ob.contractId,
            obligationId: ob.id,
            userId: ob.ownerId,
            departmentId: ob.departmentId,
            type: "OBLIGATION_DUE",
            title: "התחייבות מתקרבת",
            message: `"${ob.title}" (${ob.contract.title}) בעוד ${daysUntilDue} ימים.`,
            severity: sev,
            actionUrl: `/contracts/${ob.contractId}`,
            dueDate: ob.dueDate,
          },
        })
        created++
      }
    }
  }

  revalidatePath("/notifications")
  revalidatePath("/dashboard")
  return { created }
}
