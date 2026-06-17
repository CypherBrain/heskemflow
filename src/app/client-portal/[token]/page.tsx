import { notFound } from "next/navigation"
import { getSignatureRequestByToken } from "@/actions/client-portal"
import { serializePrisma } from "@/lib/serialize"
import { ClientPortalForm } from "./client-portal-form"

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const sigRequest = await getSignatureRequestByToken(token)

  if (!sigRequest) {
    notFound()
  }

  const data = serializePrisma(sigRequest)
  const contract = data.contract
  const latestVersion = contract.versions?.[0] ?? null
  const content = (latestVersion?.content ?? {}) as Record<string, unknown>

  const portalData = {
    token: data.token,
    status: data.status as string,
    signerEmail: data.signerEmail,
    signerName: data.signerContact?.fullName ?? data.signerEmail,
    contract: {
      title: contract.title,
      contractType: contract.contractType,
      companyName: contract.company?.name ?? null,
      contactName: contract.contact?.fullName ?? null,
      contactTitle: contract.contact?.title ?? null,
      amount: contract.amount ? Number(contract.amount) : null,
      currency: contract.currency,
      startDate: contract.startDate as unknown as string | null,
      endDate: contract.endDate as unknown as string | null,
    },
    versionContent: {
      clauses: (content.clauses ?? []) as { id: string; title: string; category: string; content: string }[],
      paymentTerms: (content.paymentTerms ?? null) as string | null,
      customNotes: (content.customNotes ?? null) as string | null,
      company: content.company as { name: string; registrationNumber?: string | null; address?: string | null } | null,
      contact: content.contact as { fullName: string; email?: string | null; phone?: string | null; title?: string | null; isSignatory?: boolean } | null,
    },
  }

  return <ClientPortalForm data={portalData} />
}
