"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { Prisma } from "@prisma/client"

export async function listDepartments() {
  const { organizationId } = await getCurrentUser()
  return prisma.department.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: {
      manager: { select: { id: true, fullName: true } },
      _count: {
        select: {
          users: true,
          obligations: { where: { status: { not: "COMPLETED" } } },
          notifications: { where: { status: "UNREAD" } },
        },
      },
    },
  })
}

export async function getDepartmentById(id: string) {
  const { organizationId } = await getCurrentUser()
  return prisma.department.findFirst({
    where: { id, organizationId },
    include: {
      manager: { select: { id: true, fullName: true } },
      users: { select: { id: true, fullName: true, email: true, role: true, isActive: true } },
    },
  })
}

export async function createDepartment(data: {
  name: string
  description?: string
  managerId?: string
}) {
  const { organizationId } = await getCurrentUser()
  const dept = await prisma.department.create({
    data: {
      organizationId,
      name: data.name,
      description: data.description || null,
      managerId: data.managerId || null,
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      action: "DEPARTMENT_CREATED",
      metadata: { name: data.name } as Prisma.InputJsonValue,
    },
  })

  revalidatePath("/departments")
  return dept
}

export async function updateDepartment(id: string, data: {
  name?: string
  description?: string
  managerId?: string | null
  isActive?: boolean
}) {
  const { organizationId } = await getCurrentUser()
  const dept = await prisma.department.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.managerId !== undefined && { managerId: data.managerId }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      action: "DEPARTMENT_UPDATED",
      metadata: { departmentId: id, changes: data } as Prisma.InputJsonValue,
    },
  })

  revalidatePath("/departments")
  return dept
}

export async function assignUserToDepartment(userId: string, departmentId: string | null) {
  const { organizationId } = await getCurrentUser()
  await prisma.user.update({
    where: { id: userId },
    data: { departmentId },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      action: "USER_DEPARTMENT_ASSIGNED",
      metadata: { userId, departmentId } as Prisma.InputJsonValue,
    },
  })

  revalidatePath("/departments")
  revalidatePath("/settings")
}

export async function listDepartmentUsers(departmentId: string) {
  return prisma.user.findMany({
    where: { departmentId },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, email: true, role: true, title: true, isActive: true },
  })
}
