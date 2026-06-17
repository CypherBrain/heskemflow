"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export async function createSignatureRequest(data: {
  contractId: string
  signerContactId?: string
  signerEmail: string
}) {
  const { organizationId } = await getCurrentUser()
  const token = crypto.randomBytes(32).toString("hex")

  const sigRequest = await prisma.signatureRequest.create({
    data: {
      contractId: data.contractId,
      signerContactId: data.signerContactId || null,
      signerEmail: data.signerEmail,
      token,
      status: "PENDING",
    },
  })

  await prisma.contract.update({
    where: { id: data.contractId },
    data: { status: "SENT_FOR_SIGNATURE" },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      contractId: data.contractId,
      action: "SIGNATURE_REQUESTED",
      metadata: {
        signerEmail: data.signerEmail,
        token,
      },
    },
  })

  revalidatePath(`/contracts/${data.contractId}`)
  revalidatePath("/contracts")
  revalidatePath("/presign")
  return { token: sigRequest.token, id: sigRequest.id }
}

export async function getSignatureRequestByToken(token: string) {
  const sigRequest = await prisma.signatureRequest.findUnique({
    where: { token },
    include: {
      contract: {
        include: {
          company: true,
          contact: true,
          template: true,
          versions: {
            orderBy: { versionNumber: "desc" as const },
            take: 1,
          },
        },
      },
      signerContact: true,
    },
  })

  if (!sigRequest) return null

  if (sigRequest.status === "PENDING" && !sigRequest.viewedAt) {
    await prisma.signatureRequest.update({
      where: { id: sigRequest.id },
      data: { status: "VIEWED", viewedAt: new Date() },
    })
  }

  return sigRequest
}

export async function signContract(token: string) {
  const sigRequest = await prisma.signatureRequest.findUnique({
    where: { token },
    include: { contract: { select: { organizationId: true } } },
  })

  if (!sigRequest) throw new Error("Signature request not found")
  if (sigRequest.status === "SIGNED") throw new Error("Already signed")

  await prisma.signatureRequest.update({
    where: { id: sigRequest.id },
    data: {
      status: "SIGNED",
      signedAt: new Date(),
      auditData: {
        signedAt: new Date().toISOString(),
        method: "mock_electronic_signature",
        userAgent: "client-portal",
      },
    },
  })

  const pendingSigs = await prisma.signatureRequest.count({
    where: {
      contractId: sigRequest.contractId,
      status: { not: "SIGNED" },
      id: { not: sigRequest.id },
    },
  })

  const newContractStatus = pendingSigs === 0 ? "SIGNED" : "SENT_FOR_SIGNATURE"

  await prisma.contract.update({
    where: { id: sigRequest.contractId },
    data: { status: newContractStatus },
  })

  await prisma.auditLog.create({
    data: {
      organizationId: sigRequest.contract.organizationId,
      contractId: sigRequest.contractId,
      action: "CONTRACT_SIGNED",
      metadata: {
        signerEmail: sigRequest.signerEmail,
        signedAt: new Date().toISOString(),
      },
    },
  })

  revalidatePath(`/contracts/${sigRequest.contractId}`)
  revalidatePath("/contracts")
  revalidatePath("/presign")
  return { success: true }
}

export async function clientRequestChanges(data: {
  token: string
  comment: string
}) {
  const sigRequest = await prisma.signatureRequest.findUnique({
    where: { token: data.token },
    include: {
      contract: { select: { organizationId: true } },
      signerContact: { select: { fullName: true } },
    },
  })

  if (!sigRequest) throw new Error("Signature request not found")

  const authorName = sigRequest.signerContact?.fullName ?? sigRequest.signerEmail

  await prisma.comment.create({
    data: {
      contractId: sigRequest.contractId,
      authorName,
      visibility: "CLIENT",
      body: data.comment,
    },
  })

  await prisma.contract.update({
    where: { id: sigRequest.contractId },
    data: { status: "CHANGES_REQUESTED" },
  })

  await prisma.auditLog.create({
    data: {
      organizationId: sigRequest.contract.organizationId,
      contractId: sigRequest.contractId,
      action: "CLIENT_REQUESTED_CHANGES",
      metadata: {
        signerEmail: sigRequest.signerEmail,
        comment: data.comment,
      },
    },
  })

  revalidatePath(`/contracts/${sigRequest.contractId}`)
  revalidatePath("/contracts")
  return { success: true }
}
