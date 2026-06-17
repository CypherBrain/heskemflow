import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

export interface AuthUser {
  userId: string
  organizationId: string
  role: UserRole
  fullName: string
  email: string
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { userId: clerkUserId } = await auth()

  if (!clerkUserId) {
    throw new Error("Unauthorized")
  }

  const existing = await prisma.user.findUnique({
    where: { clerkUserId },
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

  const clerkUser = await currentUser()
  if (!clerkUser) throw new Error("Unauthorized")

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    "User"
  const email =
    clerkUser.emailAddresses[0]?.emailAddress ?? "unknown@example.com"

  const org = await prisma.organization.create({
    data: {
      name: `${fullName} - ארגון`,
      country: "Israel",
      defaultLanguage: "he",
    },
  })

  const user = await prisma.user.create({
    data: {
      clerkUserId,
      organizationId: org.id,
      fullName,
      email,
      role: "ADMIN",
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
