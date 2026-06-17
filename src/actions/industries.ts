"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function getIndustryPacks() {
  const { organizationId } = await getCurrentUser()
  return prisma.industryPack.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: {
      templates: {
        where: { isActive: true },
        select: { id: true, name: true, contractType: true },
      },
    },
  })
}

export async function getIndustryPackBySlug(slug: string) {
  const { organizationId } = await getCurrentUser()
  return prisma.industryPack.findFirst({
    where: { slug, organizationId },
    include: {
      templates: {
        where: { isActive: true },
        include: {
          contracts: { select: { id: true } },
        },
      },
    },
  })
}
