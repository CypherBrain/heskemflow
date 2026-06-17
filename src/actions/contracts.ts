"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { serializePrisma } from "@/lib/serialize"
import { revalidatePath } from "next/cache"
import type { ContractStatus } from "@prisma/client"

export async function getContracts(status?: string) {
  const { organizationId } = await getCurrentUser()
  const where: Record<string, unknown> = { organizationId }
  if (status && status !== "all") {
    where.status = status
  }

  return prisma.contract.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      company: true,
      contact: true,
      template: true,
      internalOwner: true,
    },
  })
}

export async function getContractById(id: string) {
  const { organizationId } = await getCurrentUser()
  return prisma.contract.findFirst({
    where: { id, organizationId },
    include: {
      company: true,
      contact: true,
      deal: true,
      template: true,
      internalOwner: true,
      versions: {
        orderBy: { versionNumber: "desc" },
        include: { createdBy: true },
      },
      approvals: {
        orderBy: { createdAt: "desc" },
        include: { requestedBy: true, approver: true },
      },
      signatureRequests: {
        orderBy: { createdAt: "desc" },
        include: { signerContact: true },
      },
      obligations: {
        orderBy: { dueDate: "asc" },
        include: { owner: true },
      },
      renewalReminders: {
        orderBy: { reminderDate: "asc" },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { author: true },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: true },
      },
    },
  })
}

export async function updateContractStatus(
  contractId: string,
  newStatus: ContractStatus
) {
  const existing = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { status: true, organizationId: true },
  })

  if (!existing) throw new Error("Contract not found")

  const oldStatus = existing.status

  await prisma.contract.update({
    where: { id: contractId },
    data: { status: newStatus },
  })

  await prisma.auditLog.create({
    data: {
      organizationId: existing.organizationId,
      contractId,
      action: "CONTRACT_STATUS_UPDATED",
      metadata: { oldStatus, newStatus },
    },
  })

  revalidatePath(`/contracts/${contractId}`)
  revalidatePath("/contracts")
  revalidatePath("/presign")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function getPresignContracts() {
  const { organizationId } = await getCurrentUser()
  const contracts = await prisma.contract.findMany({
    where: { organizationId },
    orderBy: { updatedAt: "desc" },
    include: {
      company: { select: { name: true } },
      contact: { select: { fullName: true } },
      internalOwner: { select: { fullName: true } },
    },
  })

  return serializePrisma(contracts) as unknown as PresignContract[]
}

export interface PresignContract {
  id: string
  title: string
  contractType: string
  status: ContractStatus
  amount: number | null
  currency: string
  renewalDate: string | null
  updatedAt: string
  company: { name: string } | null
  contact: { fullName: string } | null
  internalOwner: { fullName: string } | null
}

export async function createContractFull(data: {
  title: string
  contractType: string
  companyId: string
  contactId: string
  dealId?: string
  templateId?: string
  industry: string
  status: ContractStatus
  amount?: number
  currency: string
  startDate: string
  endDate?: string
  renewalDate?: string
  cancellationNoticeDays?: number
  internalOwnerId: string
  selectedClauseIds?: string[]
  paymentTerms?: string
  customNotes?: string
}) {
  const { organizationId } = await getCurrentUser()

  const [templateRecord, companyRecord, contactRecord] = await Promise.all([
    data.templateId
      ? prisma.contractTemplate.findUnique({
          where: { id: data.templateId },
          select: { id: true, name: true, content: true, contractType: true },
        })
      : null,
    data.companyId
      ? prisma.company.findUnique({
          where: { id: data.companyId },
          select: { name: true, registrationNumber: true, address: true, industry: true },
        })
      : null,
    data.contactId
      ? prisma.contact.findUnique({
          where: { id: data.contactId },
          select: { fullName: true, email: true, phone: true, title: true, isSignatory: true },
        })
      : null,
  ])

  const contract = await prisma.contract.create({
    data: {
      organizationId,
      title: data.title,
      contractType: data.contractType,
      companyId: data.companyId || null,
      contactId: data.contactId || null,
      dealId: data.dealId || null,
      templateId: data.templateId || null,
      industry: data.industry || null,
      amount: data.amount || null,
      currency: data.currency || "ILS",
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      renewalDate: data.renewalDate ? new Date(data.renewalDate) : null,
      cancellationNoticeDays: data.cancellationNoticeDays || null,
      internalOwnerId: data.internalOwnerId || null,
      status: data.status,
    },
  })

  let selectedClauses: { id: string; title: string; category: string; content: string }[] = []
  if (data.selectedClauseIds && data.selectedClauseIds.length > 0) {
    const clauseRecords = await prisma.clause.findMany({
      where: { id: { in: data.selectedClauseIds }, organizationId },
      select: { id: true, title: true, category: true, content: true },
    })
    selectedClauses = clauseRecords
  }

  const versionContent = {
    title: data.title,
    contractType: data.contractType,
    industry: data.industry || null,
    templateName: templateRecord?.name ?? null,
    templateContent: templateRecord?.content ?? null,
    company: companyRecord
      ? {
          name: companyRecord.name,
          registrationNumber: companyRecord.registrationNumber ?? null,
          address: companyRecord.address ?? null,
        }
      : null,
    contact: contactRecord
      ? {
          fullName: contactRecord.fullName,
          email: contactRecord.email ?? null,
          phone: contactRecord.phone ?? null,
          title: contactRecord.title ?? null,
          isSignatory: contactRecord.isSignatory,
        }
      : null,
    amount: data.amount ?? null,
    currency: data.currency,
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    renewalDate: data.renewalDate || null,
    cancellationNoticeDays: data.cancellationNoticeDays ?? null,
    paymentTerms: data.paymentTerms || null,
    customNotes: data.customNotes || null,
    clauses: selectedClauses,
  }

  await prisma.contractVersion.create({
    data: {
      contractId: contract.id,
      versionNumber: 1,
      content: versionContent,
      createdById: data.internalOwnerId || null,
      changeSummary: "גרסה ראשונית — יצירת חוזה",
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      contractId: contract.id,
      actorId: data.internalOwnerId || null,
      action: "CONTRACT_CREATED",
      metadata: {
        title: data.title,
        contractType: data.contractType,
        status: data.status,
      },
    },
  })

  if (data.renewalDate) {
    await prisma.renewalReminder.create({
      data: {
        contractId: contract.id,
        reminderDate: new Date(data.renewalDate),
        reminderType: "RENEWAL",
        status: "SCHEDULED",
      },
    })
  }

  revalidatePath("/contracts")
  revalidatePath("/dashboard")

  return { id: contract.id }
}

export async function getFormLookupData() {
  const { organizationId } = await getCurrentUser()
  const [companies, contacts, deals, templates, users, clauses] = await Promise.all([
    prisma.company.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.contact.findMany({
      where: { organizationId },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, companyId: true },
    }),
    prisma.deal.findMany({
      where: { organizationId },
      orderBy: { title: "asc" },
      select: { id: true, title: true, companyId: true },
    }),
    prisma.contractTemplate.findMany({
      where: { organizationId, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, contractType: true },
    }),
    prisma.user.findMany({
      where: { organizationId },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, role: true },
    }),
    prisma.clause.findMany({
      where: { organizationId },
      orderBy: { title: "asc" },
      select: { id: true, title: true, category: true, riskLevel: true, content: true },
    }),
  ])

  return { companies, contacts, deals, templates, users, clauses }
}

export async function createRenewalReminder(data: {
  contractId: string
  reminderDate: Date
  reminderType: string
}) {
  const reminder = await prisma.renewalReminder.create({
    data: {
      contractId: data.contractId,
      reminderDate: data.reminderDate,
      reminderType: data.reminderType,
      status: "SCHEDULED",
    },
  })

  revalidatePath(`/contracts/${data.contractId}`)
  revalidatePath("/reminders")
  return reminder
}

export async function createObligation(data: {
  contractId: string
  title: string
  description?: string
  obligationType: string
  dueDate?: string
  ownerId?: string
}) {
  const { organizationId } = await getCurrentUser()
  const obligation = await prisma.contractObligation.create({
    data: {
      contractId: data.contractId,
      title: data.title,
      description: data.description || null,
      obligationType: data.obligationType,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      ownerId: data.ownerId || null,
      status: "OPEN",
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      contractId: data.contractId,
      action: "OBLIGATION_CREATED",
      metadata: { title: data.title, obligationType: data.obligationType },
    },
  })

  revalidatePath(`/contracts/${data.contractId}`)
  return obligation
}

export async function createVersion(data: {
  contractId: string
  changeSummary: string
}) {
  const { organizationId } = await getCurrentUser()
  const lastVersion = await prisma.contractVersion.findFirst({
    where: { contractId: data.contractId },
    orderBy: { versionNumber: "desc" },
  })

  const newVersionNumber = (lastVersion?.versionNumber ?? 0) + 1

  const version = await prisma.contractVersion.create({
    data: {
      contractId: data.contractId,
      versionNumber: newVersionNumber,
      content: { note: data.changeSummary },
      changeSummary: data.changeSummary,
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      contractId: data.contractId,
      action: "VERSION_CREATED",
      metadata: { versionNumber: newVersionNumber, changeSummary: data.changeSummary },
    },
  })

  revalidatePath(`/contracts/${data.contractId}`)
  return version
}

export async function createVersionWithSnapshot(data: {
  contractId: string
  changeSummary: string
}) {
  const { organizationId } = await getCurrentUser()
  const contract = await prisma.contract.findFirst({
    where: { id: data.contractId, organizationId },
    include: {
      company: {
        select: { name: true, registrationNumber: true, address: true, industry: true },
      },
      contact: {
        select: { fullName: true, email: true, phone: true, title: true, isSignatory: true },
      },
      template: {
        select: { id: true, name: true, content: true, contractType: true },
      },
    },
  })

  if (!contract) throw new Error("Contract not found")

  const lastVersion = await prisma.contractVersion.findFirst({
    where: { contractId: data.contractId },
    orderBy: { versionNumber: "desc" },
  })

  const previousContent = (lastVersion?.content as Record<string, unknown>) ?? {}
  const previousClauses = Array.isArray(previousContent.clauses)
    ? previousContent.clauses
    : []

  const newVersionNumber = (lastVersion?.versionNumber ?? 0) + 1

  const versionContent = {
    title: contract.title,
    contractType: contract.contractType,
    industry: contract.industry ?? null,
    templateName: contract.template?.name ?? null,
    templateContent: contract.template?.content ?? null,
    company: contract.company
      ? {
          name: contract.company.name,
          registrationNumber: contract.company.registrationNumber ?? null,
          address: contract.company.address ?? null,
        }
      : null,
    contact: contract.contact
      ? {
          fullName: contract.contact.fullName,
          email: contract.contact.email ?? null,
          phone: contract.contact.phone ?? null,
          title: contract.contact.title ?? null,
          isSignatory: contract.contact.isSignatory,
        }
      : null,
    amount: contract.amount ? Number(contract.amount) : null,
    currency: contract.currency,
    startDate: contract.startDate?.toISOString() ?? null,
    endDate: contract.endDate?.toISOString() ?? null,
    renewalDate: contract.renewalDate?.toISOString() ?? null,
    cancellationNoticeDays: contract.cancellationNoticeDays ?? null,
    paymentTerms: (previousContent.paymentTerms as string) ?? null,
    customNotes: (previousContent.customNotes as string) ?? null,
    clauses: previousClauses,
  }

  const version = await prisma.contractVersion.create({
    data: {
      contractId: data.contractId,
      versionNumber: newVersionNumber,
      content: versionContent,
      changeSummary: data.changeSummary,
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      contractId: data.contractId,
      action: "CONTRACT_VERSION_CREATED",
      metadata: {
        versionNumber: newVersionNumber,
        changeSummary: data.changeSummary,
      },
    },
  })

  revalidatePath(`/contracts/${data.contractId}`)
  return version
}

export async function requestApproval(data: {
  contractId: string
  approverId: string
  approvalType: string
  note?: string
}) {
  const { organizationId } = await getCurrentUser()
  const approval = await prisma.approvalRequest.create({
    data: {
      contractId: data.contractId,
      approverId: data.approverId || null,
      approvalType: data.approvalType,
      note: data.note || null,
      status: "PENDING",
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      contractId: data.contractId,
      action: "APPROVAL_REQUESTED",
      metadata: { approvalType: data.approvalType, approverId: data.approverId },
    },
  })

  revalidatePath(`/contracts/${data.contractId}`)
  return approval
}

export async function addComment(data: {
  contractId: string
  authorName: string
  visibility: "INTERNAL" | "CLIENT"
  body: string
}) {
  const { organizationId } = await getCurrentUser()
  const comment = await prisma.comment.create({
    data: {
      contractId: data.contractId,
      authorName: data.authorName,
      visibility: data.visibility,
      body: data.body,
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      contractId: data.contractId,
      action: "COMMENT_ADDED",
      metadata: { authorName: data.authorName, visibility: data.visibility },
    },
  })

  revalidatePath(`/contracts/${data.contractId}`)
  return comment
}

export async function createRenewalReminderForContract(data: {
  contractId: string
  reminderDate: string
  reminderType: string
}) {
  const { organizationId } = await getCurrentUser()
  const reminder = await prisma.renewalReminder.create({
    data: {
      contractId: data.contractId,
      reminderDate: new Date(data.reminderDate),
      reminderType: data.reminderType,
      status: "SCHEDULED",
    },
  })

  await prisma.auditLog.create({
    data: {
      organizationId,
      contractId: data.contractId,
      action: "RENEWAL_REMINDER_CREATED",
      metadata: { reminderDate: data.reminderDate, reminderType: data.reminderType },
    },
  })

  revalidatePath(`/contracts/${data.contractId}`)
  revalidatePath("/reminders")
  return reminder
}

export async function getOrgUsers() {
  const { organizationId } = await getCurrentUser()
  return prisma.user.findMany({
    where: { organizationId },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, role: true },
  })
}
