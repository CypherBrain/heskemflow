"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { serializePrisma } from "@/lib/serialize"
import type { Prisma, ObligationPriority, TriggerType, ObligationStatus } from "@prisma/client"

export async function createObligationFull(data: {
  contractId: string
  title: string
  description?: string
  obligationType: string
  dueDate?: string
  ownerId?: string
  departmentId?: string
  priority?: ObligationPriority
  triggerType?: TriggerType
  notifyBeforeDays?: number
  source?: string
}) {
  const { organizationId } = await getCurrentUser()
  const ob = await prisma.contractObligation.create({
    data: {
      contractId: data.contractId,
      title: data.title,
      description: data.description || null,
      obligationType: data.obligationType,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      ownerId: data.ownerId || null,
      departmentId: data.departmentId || null,
      priority: data.priority ?? "MEDIUM",
      triggerType: data.triggerType ?? null,
      notifyBeforeDays: data.notifyBeforeDays ?? null,
      source: data.source ?? "manual",
      status: "OPEN",
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      contractId: data.contractId,
      action: "OBLIGATION_CREATED",
      metadata: { title: data.title, obligationType: data.obligationType, source: data.source ?? "manual" } as Prisma.InputJsonValue,
    },
  })

  revalidatePath(`/contracts/${data.contractId}`)
  revalidatePath("/obligations")
  return ob
}

export async function updateObligation(id: string, data: {
  title?: string
  description?: string
  obligationType?: string
  dueDate?: string | null
  ownerId?: string | null
  departmentId?: string | null
  priority?: ObligationPriority
  triggerType?: TriggerType | null
  notifyBeforeDays?: number | null
  status?: ObligationStatus
}) {
  const ob = await prisma.contractObligation.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.obligationType !== undefined && { obligationType: data.obligationType }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      ...(data.ownerId !== undefined && { ownerId: data.ownerId }),
      ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.triggerType !== undefined && { triggerType: data.triggerType }),
      ...(data.notifyBeforeDays !== undefined && { notifyBeforeDays: data.notifyBeforeDays }),
      ...(data.status !== undefined && { status: data.status }),
    },
  })

  revalidatePath(`/contracts/${ob.contractId}`)
  revalidatePath("/obligations")
  return ob
}

export async function completeObligation(id: string) {
  const { organizationId } = await getCurrentUser()
  const ob = await prisma.contractObligation.update({
    where: { id },
    data: { status: "COMPLETED", completedAt: new Date() },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      contractId: ob.contractId,
      action: "OBLIGATION_COMPLETED",
      metadata: { title: ob.title } as Prisma.InputJsonValue,
    },
  })

  revalidatePath(`/contracts/${ob.contractId}`)
  revalidatePath("/obligations")
  revalidatePath("/dashboard")
  return ob
}

export async function listObligationsByContract(contractId: string) {
  return prisma.contractObligation.findMany({
    where: { contractId },
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    include: {
      owner: { select: { id: true, fullName: true } },
      department: { select: { id: true, name: true } },
    },
  })
}

export async function listAllObligations(filters?: {
  status?: string
  departmentId?: string
  ownerId?: string
  priority?: string
  contractId?: string
}) {
  const { organizationId } = await getCurrentUser()
  const where: Prisma.ContractObligationWhereInput = {
    contract: { organizationId },
  }

  if (filters?.status && filters.status !== "all") where.status = filters.status as ObligationStatus
  if (filters?.departmentId) where.departmentId = filters.departmentId
  if (filters?.ownerId) where.ownerId = filters.ownerId
  if (filters?.priority) where.priority = filters.priority as ObligationPriority
  if (filters?.contractId) where.contractId = filters.contractId

  const obligations = await prisma.contractObligation.findMany({
    where,
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    include: {
      contract: { select: { id: true, title: true } },
      owner: { select: { id: true, fullName: true } },
      department: { select: { id: true, name: true } },
    },
  })

  return serializePrisma(obligations) as unknown as SerializedObligation[]
}

export interface SerializedObligation {
  id: string
  contractId: string
  title: string
  description: string | null
  obligationType: string
  dueDate: string | null
  priority: string
  status: string
  source: string
  createdAt: string
  completedAt: string | null
  contract: { id: string; title: string }
  owner: { id: string; fullName: string } | null
  department: { id: string; name: string } | null
}

export async function getObligationStats() {
  const { organizationId } = await getCurrentUser()
  const now = new Date()
  const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [overdue, dueThisWeek, open, completed] = await Promise.all([
    prisma.contractObligation.count({
      where: {
        contract: { organizationId },
        status: { not: "COMPLETED" },
        dueDate: { lt: now },
      },
    }),
    prisma.contractObligation.count({
      where: {
        contract: { organizationId },
        status: { not: "COMPLETED" },
        dueDate: { gte: now, lte: endOfWeek },
      },
    }),
    prisma.contractObligation.count({
      where: {
        contract: { organizationId },
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
    }),
    prisma.contractObligation.count({
      where: {
        contract: { organizationId },
        status: "COMPLETED",
      },
    }),
  ])

  return { overdue, dueThisWeek, open, completed }
}
