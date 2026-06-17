"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getClauses(filters?: {
  category?: string
  search?: string
  riskLevel?: string
  language?: string
  industry?: string
}) {
  const { organizationId } = await getCurrentUser()
  const where: Record<string, unknown> = { organizationId }

  if (filters?.category && filters.category !== "all") {
    where.category = filters.category
  }

  if (filters?.riskLevel && filters.riskLevel !== "all") {
    where.riskLevel = filters.riskLevel
  }

  if (filters?.language && filters.language !== "all") {
    where.language = filters.language
  }

  if (filters?.industry && filters.industry !== "all") {
    where.industry = filters.industry
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { content: { contains: filters.search } },
      { category: { contains: filters.search } },
    ]
  }

  return prisma.clause.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })
}

export async function getClauseById(id: string) {
  const { organizationId } = await getCurrentUser()
  return prisma.clause.findFirst({
    where: { id, organizationId },
  })
}

export async function getClauseFilterOptions() {
  const { organizationId } = await getCurrentUser()
  const clauses = await prisma.clause.findMany({
    where: { organizationId },
    select: { category: true, riskLevel: true, language: true, industry: true },
  })

  const categories = [...new Set(clauses.map((c) => c.category))]
  const riskLevels = [...new Set(clauses.map((c) => c.riskLevel))]
  const languages = [...new Set(clauses.map((c) => c.language))]
  const industries = [...new Set(clauses.map((c) => c.industry).filter(Boolean))] as string[]

  return { categories, riskLevels, languages, industries }
}

export async function getClauseCategories() {
  const { organizationId } = await getCurrentUser()
  const clauses = await prisma.clause.findMany({
    where: { organizationId },
    select: { category: true },
    distinct: ["category"],
  })

  return clauses.map((c) => c.category)
}

export async function createClause(data: {
  title: string
  category: string
  language: string
  riskLevel: string
  content: string
  industry?: string
}) {
  const { organizationId } = await getCurrentUser()
  const clause = await prisma.clause.create({
    data: {
      organizationId,
      title: data.title,
      category: data.category,
      language: data.language,
      riskLevel: data.riskLevel,
      content: data.content,
      industry: data.industry || null,
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      action: "CLAUSE_CREATED",
      metadata: {
        clauseId: clause.id,
        title: data.title,
        category: data.category,
        riskLevel: data.riskLevel,
      },
    },
  })

  revalidatePath("/clauses")
  return clause
}

export async function updateClause(
  id: string,
  data: {
    title?: string
    category?: string
    language?: string
    riskLevel?: string
    content?: string
    industry?: string | null
  }
) {
  const { organizationId } = await getCurrentUser()
  const existing = await prisma.clause.findFirst({
    where: { id, organizationId },
  })

  if (!existing) throw new Error("Clause not found")

  const clause = await prisma.clause.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.language !== undefined && { language: data.language }),
      ...(data.riskLevel !== undefined && { riskLevel: data.riskLevel }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.industry !== undefined && { industry: data.industry }),
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      action: "CLAUSE_UPDATED",
      metadata: {
        clauseId: id,
        changes: Object.keys(data),
        title: clause.title,
      },
    },
  })

  revalidatePath("/clauses")
  return clause
}

export async function deleteClause(id: string) {
  const { organizationId } = await getCurrentUser()
  const existing = await prisma.clause.findFirst({
    where: { id, organizationId },
  })

  if (!existing) throw new Error("Clause not found")

  await prisma.clause.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      organizationId,
      action: "CLAUSE_DELETED",
      metadata: {
        clauseId: id,
        title: existing.title,
        category: existing.category,
      },
    },
  })

  revalidatePath("/clauses")
  return { success: true }
}
