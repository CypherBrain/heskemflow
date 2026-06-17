"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getTemplates(filters?: {
  industry?: string
  language?: string
  contractType?: string
  includeInactive?: boolean
}) {
  const { organizationId } = await getCurrentUser()
  const where: Record<string, unknown> = { organizationId }

  if (!filters?.includeInactive) {
    where.isActive = true
  }

  if (filters?.industry) {
    where.industryPack = { slug: filters.industry }
  }

  if (filters?.language && filters.language !== "all") {
    where.language = filters.language
  }

  if (filters?.contractType && filters.contractType !== "all") {
    where.contractType = filters.contractType
  }

  return prisma.contractTemplate.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      industryPack: true,
      _count: { select: { contracts: true } },
    },
  })
}

export async function getTemplateById(id: string) {
  const { organizationId } = await getCurrentUser()
  return prisma.contractTemplate.findFirst({
    where: { id, organizationId },
    include: {
      industryPack: true,
      contracts: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { company: true },
      },
    },
  })
}

export async function getTemplateFilterOptions() {
  const { organizationId } = await getCurrentUser()
  const [templates, industryPacks] = await Promise.all([
    prisma.contractTemplate.findMany({
      where: { organizationId },
      select: { contractType: true, language: true },
      distinct: ["contractType", "language"],
    }),
    prisma.industryPack.findMany({
      where: { organizationId },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ])

  const contractTypes = [...new Set(templates.map((t) => t.contractType))]
  const languages = [...new Set(templates.map((t) => t.language))]

  return { contractTypes, languages, industryPacks }
}

export async function createTemplate(data: {
  name: string
  language: string
  contractType: string
  content: unknown
  industryPackId?: string
  isActive?: boolean
}) {
  const { organizationId } = await getCurrentUser()
  const template = await prisma.contractTemplate.create({
    data: {
      organizationId,
      name: data.name,
      language: data.language,
      contractType: data.contractType,
      content: data.content as never,
      industryPackId: data.industryPackId || null,
      isActive: data.isActive ?? true,
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      action: "TEMPLATE_CREATED",
      metadata: {
        templateId: template.id,
        name: data.name,
        contractType: data.contractType,
      },
    },
  })

  revalidatePath("/templates")
  return template
}

export async function updateTemplate(
  id: string,
  data: {
    name?: string
    language?: string
    contractType?: string
    content?: unknown
    industryPackId?: string | null
    isActive?: boolean
  }
) {
  const { organizationId } = await getCurrentUser()
  const existing = await prisma.contractTemplate.findFirst({
    where: { id, organizationId },
  })

  if (!existing) throw new Error("Template not found")

  const template = await prisma.contractTemplate.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.language !== undefined && { language: data.language }),
      ...(data.contractType !== undefined && { contractType: data.contractType }),
      ...(data.content !== undefined && { content: data.content as never }),
      ...(data.industryPackId !== undefined && { industryPackId: data.industryPackId }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      action: "TEMPLATE_UPDATED",
      metadata: {
        templateId: id,
        changes: Object.keys(data),
        name: template.name,
      },
    },
  })

  revalidatePath("/templates")
  revalidatePath("/contracts/new")
  return template
}

export async function deactivateTemplate(id: string) {
  const { organizationId } = await getCurrentUser()
  const existing = await prisma.contractTemplate.findFirst({
    where: { id, organizationId },
  })

  if (!existing) throw new Error("Template not found")

  await prisma.contractTemplate.update({
    where: { id },
    data: { isActive: false },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      action: "TEMPLATE_UPDATED",
      metadata: {
        templateId: id,
        name: existing.name,
        change: "deactivated",
      },
    },
  })

  revalidatePath("/templates")
  revalidatePath("/contracts/new")
  return { success: true }
}

export async function activateTemplate(id: string) {
  const { organizationId } = await getCurrentUser()
  const existing = await prisma.contractTemplate.findFirst({
    where: { id, organizationId },
  })

  if (!existing) throw new Error("Template not found")

  await prisma.contractTemplate.update({
    where: { id },
    data: { isActive: true },
  })

  revalidatePath("/templates")
  revalidatePath("/contracts/new")
  return { success: true }
}
