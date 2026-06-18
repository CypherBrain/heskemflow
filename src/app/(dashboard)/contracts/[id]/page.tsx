import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, FileText, Upload, Clock, Building2, User, Calendar, Shield, Brain, ListChecks, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getContractById, getOrgUsers } from "@/actions/contracts"
import { listDepartments } from "@/actions/departments"
import { statusLabels, statusColors, formatCurrency, formatDate } from "@/lib/contract-utils"
import { serializePrisma } from "@/lib/serialize"
import { StatusBadge } from "@/components/ui/status-badge"
import { PriorityBadge } from "@/components/ui/priority-badge"
import {
  StatusUpdateButton,
  CreateVersionButton,
  RequestApprovalButton,
  CreateObligationButton,
  CreateReminderButton,
  AddCommentForm,
  SendForSignatureButton,
} from "@/components/contracts/contract-actions"
import { ContractDocumentTab } from "@/components/contracts/contract-document-tab"
import type { VersionContentData } from "@/components/contracts/contract-document-tab"
import { ContractExportView } from "@/components/contracts/contract-export-view"
import { ContractAiTab } from "@/components/contracts/contract-ai-tab"

const timelineSteps = [
  { status: "DRAFT", label: "טיוטה" },
  { status: "INTERNAL_REVIEW", label: "בדיקה" },
  { status: "CLIENT_REVIEW", label: "לקוח" },
  { status: "APPROVED", label: "אישור" },
  { status: "SENT_FOR_SIGNATURE", label: "חתימה" },
  { status: "ACTIVE", label: "פעיל" },
]

const statusOrder: Record<string, number> = {
  DRAFT: 0, INTERNAL_REVIEW: 1, LEGAL_REVIEW: 1, CLIENT_REVIEW: 2, CHANGES_REQUIRED: 2,
  APPROVED: 3, SENT_FOR_SIGNATURE: 4, SIGNED: 5, ACTIVE: 5, EXPIRED: 6, CANCELLED: 6,
}

const auditColors: Record<string, string> = {
  CONTRACT_CREATED: "bg-[#16A34A]",
  CONTRACT_STATUS_UPDATED: "bg-[#2563EB]",
  VERSION_CREATED: "bg-[#7C3AED]",
  AI_REVIEW_CREATED: "bg-[#7C3AED]",
  AI_OBLIGATIONS_ACCEPTED: "bg-[#7C3AED]",
  OBLIGATION_CREATED: "bg-[#D97706]",
  OBLIGATION_COMPLETED: "bg-[#16A34A]",
  SIGNATURE_REQUESTED: "bg-[#2563EB]",
  CONTRACT_SIGNED: "bg-[#16A34A]",
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [contract, users, departments] = await Promise.all([
    getContractById(id),
    getOrgUsers(),
    listDepartments(),
  ])

  if (!contract) {
    notFound()
  }

  const currentStepIdx = statusOrder[contract.status] ?? 0

  return (
    <div className="page-shell">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <Link href="/contracts" className="hover:text-[#2563EB] transition-colors font-medium">חוזים</Link>
        <ChevronLeft className="size-3.5" />
        <span className="text-[#64748B] font-medium">{contract.title}</span>
      </div>

      {/* Hero header card */}
      <div className="premium-card overflow-hidden">
        {/* Gradient accent strip */}
        <div className="h-1.5 bg-gradient-to-l from-[#2563EB] via-[#7C3AED] to-[#2563EB]" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              {/* Company avatar */}
              <div className="hidden sm:flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] text-lg font-bold text-[#64748B] shrink-0">
                {contract.company?.name
                  ? contract.company.name.split(" ").map(w => w[0]).join("").slice(0, 2)
                  : "HF"}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F172A]">{contract.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={contract.status} size="md" />
                  <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#F1F5F9] text-[#334155] ring-1 ring-[#E2E8F0]">{contract.contractType}</span>
                  {contract.industry && (
                    <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#EDE9FE] text-[#7C3AED] ring-1 ring-[#DDD6FE]">{contract.industry}</span>
                  )}
                  {contract.amount && (
                    <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#DCFCE7] text-[#16A34A] ring-1 ring-[#BBF7D0]">
                      {formatCurrency(Number(contract.amount), contract.currency)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusUpdateButton contractId={contract.id} currentStatus={contract.status} />
              <CreateVersionButton contractId={contract.id} />
              <RequestApprovalButton contractId={contract.id} users={users} />
              <SendForSignatureButton
                contractId={contract.id}
                contacts={contract.contact
                  ? [{ id: contract.contact.id, fullName: contract.contact.fullName, email: contract.contact.email }]
                  : []
                }
              />
            </div>
          </div>

          {/* Timeline chips */}
          <div className="mt-6 flex items-center gap-1 overflow-x-auto pb-1">
            {timelineSteps.map((step, idx) => {
              const isPast = idx < currentStepIdx
              const isCurrent = idx === currentStepIdx
              return (
                <div key={step.status} className="flex items-center gap-1 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                    isCurrent ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                    : isPast ? "bg-[#DCFCE7] text-[#16A34A]"
                    : "bg-[#F1F5F9] text-[#94A3B8]"
                  }`}>
                    {isPast && <CheckCircle2 className="size-3" />}
                    {step.label}
                  </span>
                  {idx < timelineSteps.length - 1 && (
                    <div className={`w-6 h-px ${isPast ? "bg-[#16A34A]" : "bg-[#E2E8F0]"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="premium-card overflow-hidden">
            <Tabs defaultValue="overview">
              <div className="px-4 pt-4 overflow-x-auto">
                <TabsList className="flex-nowrap">
                  <TabsTrigger value="overview">סקירה</TabsTrigger>
                  <TabsTrigger value="document">מסמך חוזה</TabsTrigger>
                  <TabsTrigger value="export">ייצוא</TabsTrigger>
                  <TabsTrigger value="ai" className="gap-1.5">
                    <Brain className="size-3.5" />
                    בינה חוזית
                  </TabsTrigger>
                  <TabsTrigger value="versions">גרסאות ({contract.versions.length})</TabsTrigger>
                  <TabsTrigger value="approvals">אישורים ({contract.approvals.length})</TabsTrigger>
                  <TabsTrigger value="obligations">התחייבויות ({contract.obligations.length})</TabsTrigger>
                  <TabsTrigger value="reminders">תזכורות ({contract.renewalReminders.length})</TabsTrigger>
                  <TabsTrigger value="comments">הערות ({contract.comments.length})</TabsTrigger>
                  <TabsTrigger value="audit">יומן ({contract.auditLogs.length})</TabsTrigger>
                  <TabsTrigger value="attachments">קבצים ({contract.attachments.length})</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="p-6 space-y-5">
                <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">פרטי החוזה</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={FileText} label="כותרת" value={contract.title} />
                  <InfoRow icon={Shield} label="סטטוס" value={statusLabels[contract.status]} />
                  <InfoRow icon={FileText} label="סוג חוזה" value={contract.contractType} />
                  <InfoRow icon={Building2} label="תעשייה" value={contract.industry ?? "—"} />
                  <InfoRow icon={FileText} label="שווי" value={formatCurrency(contract.amount ? Number(contract.amount) : null, contract.currency)} />
                  <InfoRow icon={FileText} label="מטבע" value={contract.currency} />
                  <InfoRow icon={Calendar} label="תאריך התחלה" value={formatDate(contract.startDate)} />
                  <InfoRow icon={Calendar} label="תאריך סיום" value={formatDate(contract.endDate)} />
                  <InfoRow icon={Calendar} label="תאריך חידוש" value={formatDate(contract.renewalDate)} />
                  <InfoRow icon={Clock} label="ימי הודעה לביטול" value={contract.cancellationNoticeDays?.toString() ?? "—"} />
                  <InfoRow icon={User} label="אחראי פנימי" value={contract.internalOwner?.fullName ?? "—"} />
                </div>
              </TabsContent>

              <TabsContent value="document" className="p-6">
                {(() => {
                  const latestVersion = contract.versions[0]
                  if (!latestVersion) {
                    return (
                      <DetailEmptyState icon={FileText} text="אין גרסאות מסמך עדיין" hint="צור גרסה ראשונה כדי להתחיל לערוך את החוזה" />
                    )
                  }
                  const serialized = serializePrisma(latestVersion)
                  return (
                    <ContractDocumentTab
                      contractId={contract.id}
                      contractTitle={contract.title}
                      versionNumber={serialized.versionNumber}
                      versionCreatedAt={serialized.createdAt as unknown as string}
                      content={serialized.content as unknown as VersionContentData}
                    />
                  )
                })()}
              </TabsContent>

              <TabsContent value="export" className="p-6">
                {(() => {
                  const latestVersion = contract.versions[0]
                  if (!latestVersion) {
                    return (
                      <DetailEmptyState icon={Upload} text="אין גרסאות מסמך לייצוא" />
                    )
                  }
                  const serialized = serializePrisma(latestVersion)
                  const signedSig = contract.signatureRequests.find((s) => s.status === "SIGNED")
                  return (
                    <ContractExportView
                      contractId={contract.id}
                      contractTitle={contract.title}
                      contractStatus={statusLabels[contract.status] ?? contract.status}
                      versionNumber={serialized.versionNumber}
                      versionCreatedAt={serialized.createdAt as unknown as string}
                      content={serialized.content as unknown as VersionContentData}
                      signerName={signedSig?.signerContact?.fullName ?? null}
                      signerEmail={signedSig?.signerEmail ?? null}
                      signedAt={signedSig?.signedAt ? (signedSig.signedAt as unknown as string) : null}
                    />
                  )
                })()}
              </TabsContent>

              <TabsContent value="ai" className="p-6">
                <ContractAiTab
                  contractId={contract.id}
                  users={users.map((u) => ({ id: u.id, fullName: u.fullName }))}
                  departments={departments.map((d) => ({ id: d.id, name: d.name }))}
                />
              </TabsContent>

              <TabsContent value="versions" className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">גרסאות חוזה</h3>
                  <CreateVersionButton contractId={contract.id} />
                </div>
                {contract.versions.length === 0 ? (
                  <DetailEmptyState icon={FileText} text="אין גרסאות עדיין" hint="צור גרסה ראשונה" />
                ) : (
                  <div className="space-y-3">
                    {contract.versions.map((version) => (
                      <div key={version.id} className="rounded-xl border border-[#E2E8F0] p-4 hover:bg-[#F8FAFC] transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-lg bg-[#DBEAFE] text-[#2563EB] ring-1 ring-[#BFDBFE]">v{version.versionNumber}</span>
                            <span className="text-sm text-[#64748B]">{version.createdBy?.fullName ?? "מערכת"}</span>
                          </div>
                          <span className="text-xs text-[#94A3B8]">{formatDate(version.createdAt)}</span>
                        </div>
                        {version.changeSummary && (
                          <p className="mt-2 text-sm text-[#64748B]">{version.changeSummary}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approvals" className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">בקשות אישור</h3>
                  <RequestApprovalButton contractId={contract.id} users={users} />
                </div>
                {contract.approvals.length === 0 ? (
                  <DetailEmptyState icon={Shield} text="אין בקשות אישור" hint="שלח בקשת אישור לצוות" />
                ) : (
                  <div className="space-y-3">
                    {contract.approvals.map((approval) => (
                      <div key={approval.id} className="rounded-xl border border-[#E2E8F0] p-4 hover:bg-[#F8FAFC] transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A]">{approval.approvalType}</p>
                            <p className="text-xs text-[#64748B]">מאשר: {approval.approver?.fullName ?? "—"}</p>
                            {approval.requestedBy && <p className="text-xs text-[#94A3B8]">מבקש: {approval.requestedBy.fullName}</p>}
                          </div>
                          <div className="text-left space-y-1">
                            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-lg ring-1 ${approval.status === "APPROVED" ? "bg-[#DCFCE7] text-[#16A34A] ring-[#BBF7D0]" : approval.status === "REJECTED" ? "bg-[#FEE2E2] text-[#DC2626] ring-[#FECACA]" : "bg-[#FEF3C7] text-[#D97706] ring-[#FDE68A]"}`}>
                              {approval.status === "PENDING" ? "ממתין" : approval.status === "APPROVED" ? "אושר" : "נדחה"}
                            </span>
                            <p className="text-xs text-[#94A3B8]">{formatDate(approval.createdAt)}</p>
                          </div>
                        </div>
                        {approval.note && (
                          <p className="mt-3 text-sm text-[#64748B] border-r-2 border-[#DBEAFE] pr-3">{approval.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="obligations" className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">התחייבויות</h3>
                  <CreateObligationButton contractId={contract.id} users={users} />
                </div>
                {contract.obligations.length === 0 ? (
                  <DetailEmptyState icon={ListChecks} text="אין התחייבויות" hint="צור התחייבות חדשה או הפעל חילוץ AI" />
                ) : (
                  <div className="space-y-3">
                    {contract.obligations.map((ob) => {
                      const isOverdue = ob.dueDate && new Date(ob.dueDate) < new Date() && ob.status !== "COMPLETED"
                      return (
                        <div key={ob.id} className={`rounded-xl border p-4 transition-all duration-200 hover:shadow-sm ${isOverdue ? "border-[#FECACA] bg-[#FFFBFB]" : "border-[#E2E8F0] hover:bg-[#F8FAFC]"}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-[#0F172A]">{ob.title}</p>
                                <PriorityBadge priority={ob.priority} />
                              </div>
                              {ob.description && <p className="text-xs text-[#64748B] line-clamp-2">{ob.description}</p>}
                              <div className="flex flex-wrap gap-3 text-[11px] text-[#94A3B8]">
                                <span>סוג: {ob.obligationType}</span>
                                {ob.dueDate && <span className={`flex items-center gap-1 ${isOverdue ? "text-[#DC2626] font-bold" : ""}`}><Clock className="size-3" />{formatDate(ob.dueDate)}</span>}
                                {ob.owner && <span>אחראי: {ob.owner.fullName}</span>}
                                {ob.department && <span>מחלקה: {ob.department.name}</span>}
                                <span>מקור: {ob.source === "ai" ? "AI" : ob.source === "template" ? "תבנית" : "ידני"}</span>
                              </div>
                            </div>
                            <span className={`shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-lg ring-1 ${isOverdue ? "bg-[#FEE2E2] text-[#DC2626] ring-[#FECACA]" : ob.status === "COMPLETED" ? "bg-[#DCFCE7] text-[#16A34A] ring-[#BBF7D0]" : ob.status === "IN_PROGRESS" ? "bg-[#DBEAFE] text-[#2563EB] ring-[#BFDBFE]" : "bg-[#F1F5F9] text-[#64748B] ring-[#E2E8F0]"}`}>
                              {isOverdue ? "באיחור" : ob.status === "OPEN" ? "פתוח" : ob.status === "IN_PROGRESS" ? "בתהליך" : ob.status === "COMPLETED" ? "הושלם" : "באיחור"}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reminders" className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">תזכורות חידוש</h3>
                  <CreateReminderButton contractId={contract.id} />
                </div>
                {contract.renewalReminders.length === 0 ? (
                  <DetailEmptyState icon={Clock} text="אין תזכורות" hint="הגדר תזכורת לתאריך חידוש" />
                ) : (
                  <div className="space-y-3">
                    {contract.renewalReminders.map((reminder) => (
                      <div key={reminder.id} className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-4 hover:bg-[#F8FAFC] transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-[#FEF3C7]">
                            <Clock className="size-4 text-[#D97706]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A]">{reminder.reminderType}</p>
                            <p className="text-xs text-[#94A3B8]">{formatDate(reminder.reminderDate)}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-lg ring-1 ${reminder.status === "COMPLETED" ? "bg-[#DCFCE7] text-[#16A34A] ring-[#BBF7D0]" : reminder.status === "SENT" ? "bg-[#DBEAFE] text-[#2563EB] ring-[#BFDBFE]" : "bg-[#FEF3C7] text-[#D97706] ring-[#FDE68A]"}`}>
                          {reminder.status === "SCHEDULED" ? "מתוזמן" : reminder.status === "SENT" ? "נשלח" : reminder.status === "DISMISSED" ? "בוטל" : "הושלם"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="p-6 space-y-4">
                {contract.comments.length === 0 ? (
                  <p className="text-sm text-[#94A3B8] text-center py-8">אין הערות עדיין — הוסף הערה למטה</p>
                ) : (
                  <div className="space-y-3">
                    {contract.comments.map((comment) => (
                      <div key={comment.id} className="rounded-xl border border-[#E2E8F0] p-4 hover:bg-[#F8FAFC] transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] text-[10px] font-bold text-[#64748B]">
                              {comment.authorName[0]}
                            </div>
                            <span className="text-sm font-semibold text-[#0F172A]">{comment.authorName}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-lg ring-1 ${comment.visibility === "INTERNAL" ? "bg-[#F1F5F9] text-[#64748B] ring-[#E2E8F0]" : "bg-[#DBEAFE] text-[#2563EB] ring-[#BFDBFE]"}`}>
                              {comment.visibility === "INTERNAL" ? "פנימי" : "לקוח"}
                            </span>
                          </div>
                          <span className="text-xs text-[#94A3B8]">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="mt-2.5 text-sm text-[#334155] leading-relaxed">{comment.body}</p>
                      </div>
                    ))}
                  </div>
                )}
                <AddCommentForm contractId={contract.id} />
              </TabsContent>

              <TabsContent value="audit" className="p-6">
                {contract.auditLogs.length === 0 ? (
                  <DetailEmptyState icon={Clock} text="אין רשומות ביומן" />
                ) : (
                  <div className="relative space-y-0">
                    <div className="absolute start-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-[#2563EB] via-[#E2E8F0] to-[#E2E8F0]" />
                    {contract.auditLogs.map((log) => (
                      <div key={log.id} className="relative flex gap-4 pb-4">
                        <div className="relative z-10 mt-1.5">
                          <div className={`size-[10px] rounded-full ${auditColors[log.action] ?? "bg-[#94A3B8]"} ring-4 ring-white`} />
                        </div>
                        <div className="flex-1 rounded-xl border border-[#E2E8F0] p-3 bg-[#FAFBFE] hover:bg-[#F8FAFC] transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-lg bg-[#DBEAFE] text-[#2563EB] ring-1 ring-[#BFDBFE]">{translateAction(log.action)}</span>
                            <span className="text-[10px] text-[#94A3B8] font-medium">{formatDate(log.createdAt)}</span>
                          </div>
                          {log.metadata && (
                            <p className="mt-1.5 text-[11px] text-[#94A3B8] font-mono leading-relaxed" dir="ltr">
                              {JSON.stringify(log.metadata)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="attachments" className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">קבצים מצורפים</h3>
                  <Button variant="outline" size="sm" disabled className="rounded-xl gap-2 border-[#E2E8F0]">
                    <Upload className="size-4" />
                    העלאת קובץ
                  </Button>
                </div>
                {contract.attachments.length === 0 ? (
                  <DetailEmptyState icon={Upload} text="אין קבצים מצורפים" hint="העלאת קבצים תתווסף בשלב הבא" />
                ) : (
                  <div className="space-y-2">
                    {contract.attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-4 hover:bg-[#F8FAFC] transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-[#F1F5F9]">
                            <FileText className="size-4 text-[#64748B]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A]">{att.fileName}</p>
                            <p className="text-xs text-[#94A3B8]">{att.fileType ?? "—"} • {att.uploadedBy?.fullName ?? "—"}</p>
                          </div>
                        </div>
                        <span className="text-xs text-[#94A3B8]">{formatDate(att.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Company card */}
          <div className="premium-card p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex size-8 items-center justify-center rounded-xl bg-[#DBEAFE]">
                <Building2 className="size-4 text-[#2563EB]" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">חברה ואיש קשר</h3>
            </div>
            <div className="space-y-3">
              <SideInfoRow label="שם חברה" value={contract.company?.name ?? "—"} />
              <SideInfoRow label="מספר רישום" value={contract.company?.registrationNumber ?? "—"} />
              <SideInfoRow label="כתובת" value={contract.company?.address ?? "—"} />
              {contract.contact && (
                <>
                  <div className="h-px bg-gradient-to-l from-transparent via-[#E2E8F0] to-transparent my-3" />
                  <SideInfoRow label="איש קשר" value={contract.contact.fullName} />
                  <SideInfoRow label="אימייל" value={contract.contact.email ?? "—"} />
                  <SideInfoRow label="טלפון" value={contract.contact.phone ?? "—"} />
                  <SideInfoRow label="תפקיד" value={contract.contact.title ?? "—"} />
                  <SideInfoRow label="חותם" value={contract.contact.isSignatory ? "כן" : "לא"} />
                </>
              )}
            </div>
          </div>

          {/* Timeline card */}
          <div className="premium-card p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex size-8 items-center justify-center rounded-xl bg-[#EDE9FE]">
                <Calendar className="size-4 text-[#7C3AED]" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">ציר זמן</h3>
            </div>
            <div className="space-y-3">
              <TimelineRow label="נוצר" date={contract.createdAt} />
              <TimelineRow label="עדכון אחרון" date={contract.updatedAt} />
              {contract.startDate && <TimelineRow label="התחלה" date={contract.startDate} />}
              {contract.endDate && <TimelineRow label="סיום" date={contract.endDate} />}
              {contract.renewalDate && <TimelineRow label="חידוש" date={contract.renewalDate} />}
            </div>
          </div>

          {/* Signatures */}
          {contract.signatureRequests.length > 0 && (
            <div className="premium-card p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex size-8 items-center justify-center rounded-xl bg-[#DCFCE7]">
                  <CheckCircle2 className="size-4 text-[#16A34A]" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">חתימות</h3>
              </div>
              <div className="space-y-3">
                {contract.signatureRequests.map((sig) => (
                  <div key={sig.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#334155] font-medium">{sig.signerEmail}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-lg ring-1 ${sig.status === "SIGNED" ? "bg-[#DCFCE7] text-[#16A34A] ring-[#BBF7D0]" : sig.status === "VIEWED" ? "bg-[#DBEAFE] text-[#2563EB] ring-[#BFDBFE]" : sig.status === "DECLINED" ? "bg-[#FEE2E2] text-[#DC2626] ring-[#FECACA]" : "bg-[#FEF3C7] text-[#D97706] ring-[#FDE68A]"}`}>
                        {sig.status === "PENDING" ? "ממתין" : sig.status === "VIEWED" ? "נצפה" : sig.status === "SIGNED" ? "נחתם" : sig.status === "DECLINED" ? "נדחה" : "פג תוקף"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="premium-card p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex size-8 items-center justify-center rounded-xl bg-[#FEF3C7]">
                <AlertTriangle className="size-4 text-[#D97706]" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">פעולות מהירות</h3>
            </div>
            <div className="flex flex-col gap-2">
              <CreateObligationButton contractId={contract.id} users={users} />
              <CreateReminderButton contractId={contract.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#FAFBFE] p-3">
      <Icon className="size-4 text-[#94A3B8] mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-[#94A3B8] font-medium">{label}</p>
        <p className="text-sm font-semibold text-[#0F172A] truncate">{value}</p>
      </div>
    </div>
  )
}

function SideInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-[#94A3B8] font-medium">{label}</p>
      <p className="text-sm font-semibold text-[#0F172A]">{value}</p>
    </div>
  )
}

function TimelineRow({ label, date }: { label: string; date: Date }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#64748B]">{label}</span>
      <span className="font-semibold text-[#0F172A]">{formatDate(date)}</span>
    </div>
  )
}

function DetailEmptyState({ icon: Icon, text, hint }: { icon: typeof FileText; text: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-gradient-to-b from-white to-[#FAFBFE]">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F1F5F9] mb-3">
        <Icon className="size-6 text-[#94A3B8]" />
      </div>
      <p className="text-sm text-[#334155] font-bold">{text}</p>
      {hint && <p className="text-[13px] text-[#94A3B8] mt-1">{hint}</p>}
    </div>
  )
}

function translateAction(action: string): string {
  const map: Record<string, string> = {
    CONTRACT_CREATED: "חוזה נוצר",
    CONTRACT_STATUS_UPDATED: "סטטוס עודכן",
    VERSION_CREATED: "גרסה נוצרה",
    CONTRACT_VERSION_CREATED: "גרסת מסמך נוצרה",
    APPROVAL_REQUESTED: "בקשת אישור נשלחה",
    COMMENT_ADDED: "הערה נוספה",
    OBLIGATION_CREATED: "התחייבות נוצרה",
    RENEWAL_REMINDER_CREATED: "תזכורת חידוש נוצרה",
    SIGNATURE_REQUESTED: "בקשת חתימה נשלחה",
    CONTRACT_SIGNED: "חוזה נחתם",
    CLIENT_REQUESTED_CHANGES: "לקוח ביקש שינויים",
    TEMPLATE_CREATED: "תבנית נוצרה",
    TEMPLATE_UPDATED: "תבנית עודכנה",
    CLAUSE_CREATED: "סעיף נוצר",
    CLAUSE_UPDATED: "סעיף עודכן",
    CLAUSE_DELETED: "סעיף נמחק",
    AI_REVIEW_CREATED: "ניתוח AI בוצע",
    AI_OBLIGATIONS_CREATED: "התחייבויות AI נוצרו",
    AI_OBLIGATIONS_ACCEPTED: "התחייבויות AI אושרו ושויכו",
    OBLIGATION_COMPLETED: "התחייבות הושלמה",
    DEPARTMENT_CREATED: "מחלקה נוצרה",
    DEPARTMENT_UPDATED: "מחלקה עודכנה",
    USER_DEPARTMENT_ASSIGNED: "משתמש שויך למחלקה",
  }
  return map[action] ?? action
}
