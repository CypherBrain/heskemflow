"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { serializePrisma } from "@/lib/serialize"

export async function getDashboardStats() {
  const { organizationId } = await getCurrentUser()
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [
    activeContracts,
    pendingSignature,
    renewalsNext30Days,
    pendingReview,
    totalContracts,
  ] = await Promise.all([
    prisma.contract.count({
      where: { organizationId, status: "ACTIVE" },
    }),
    prisma.contract.count({
      where: { organizationId, status: "SENT_FOR_SIGNATURE" },
    }),
    prisma.contract.count({
      where: {
        organizationId,
        renewalDate: { gte: now, lte: thirtyDaysFromNow },
      },
    }),
    prisma.contract.count({
      where: {
        organizationId,
        status: { in: ["INTERNAL_REVIEW", "LEGAL_REVIEW", "CLIENT_REVIEW", "CHANGES_REQUESTED"] },
      },
    }),
    prisma.contract.count({
      where: { organizationId },
    }),
  ])

  return {
    activeContracts,
    pendingSignature,
    renewalsNext30Days,
    pendingReview,
    totalContracts,
  }
}

export async function getRecentContracts() {
  const { organizationId } = await getCurrentUser()
  const contracts = await prisma.contract.findMany({
    where: { organizationId },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: {
      company: true,
      contact: true,
      template: true,
      internalOwner: true,
    },
  })

  return serializePrisma(contracts) as unknown as {
    id: string
    title: string
    contractType: string
    status: import("@prisma/client").ContractStatus
    updatedAt: string
    company: { name: string } | null
    contact: { fullName: string } | null
    template: { name: string } | null
    internalOwner: { fullName: string } | null
  }[]
}

export async function getContractStatusBreakdown() {
  const { organizationId } = await getCurrentUser()
  const contracts = await prisma.contract.groupBy({
    by: ["status"],
    where: { organizationId },
    _count: { status: true },
  })

  return contracts.map((c) => ({
    status: c.status,
    count: c._count.status,
  }))
}

export async function getUpcomingRenewals() {
  const { organizationId } = await getCurrentUser()
  const now = new Date()
  const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

  const contracts = await prisma.contract.findMany({
    where: {
      organizationId,
      renewalDate: { gte: now, lte: sixtyDaysFromNow },
    },
    orderBy: { renewalDate: "asc" },
    take: 5,
    include: { company: true },
  })

  return serializePrisma(contracts) as unknown as {
    id: string
    title: string
    renewalDate: string | null
    company: { name: string } | null
  }[]
}
