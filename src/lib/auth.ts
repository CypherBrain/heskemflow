import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

export interface AuthUser {
  userId: string
  organizationId: string
  role: UserRole
  fullName: string
  email: string
}

const DEMO_USER = {
  clerkUserId: "demo_clerk_user",
  fullName: "מנהל מערכת",
  email: "admin@heskemflow.co.il",
  role: "ADMIN" as const,
}

export async function getCurrentUser(): Promise<AuthUser> {
  const existing = await prisma.user.findFirst({
    where: { clerkUserId: DEMO_USER.clerkUserId },
    select: {
      id: true,
      organizationId: true,
      role: true,
      fullName: true,
      email: true,
    },
  })

  if (existing) {
    return {
      userId: existing.id,
      organizationId: existing.organizationId,
      role: existing.role,
      fullName: existing.fullName,
      email: existing.email,
    }
  }

  const org = await prisma.organization.create({
    data: {
      name: `${DEMO_USER.fullName} - ארגון`,
      country: "Israel",
      defaultLanguage: "he",
    },
  })

  const user = await prisma.user.create({
    data: {
      clerkUserId: DEMO_USER.clerkUserId,
      organizationId: org.id,
      fullName: DEMO_USER.fullName,
      email: DEMO_USER.email,
      role: DEMO_USER.role,
    },
  })

  return {
    userId: user.id,
    organizationId: org.id,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
  }
}

export async function requireRole(...allowed: UserRole[]): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!allowed.includes(user.role)) {
    throw new Error("Unauthorized: insufficient permissions")
  }
  return user
}
