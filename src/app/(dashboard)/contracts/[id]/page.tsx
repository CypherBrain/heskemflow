import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, FileText, Upload, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getContractById, getOrgUsers } from "@/actions/contracts"
import { listDepartments } from "@/actions/departments"
import { statusLabels, statusColors, formatCurrency, formatDate } from "@/lib/contract-utils"
import { serializePrisma } from "@/lib/serialize"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <Link href="/contracts" className="hover:text-[#2563EB] transition-colors font-medium">חוזים</Link>
        <ChevronLeft className="size-3.5" />
        <span className="text-[#64748B]">{contract.title}</span>
      </div>

      <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F172A]">{contract.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`text-xs font-bold rounded-lg px-2.5 py-1 ${statusColors[contract.status]}`}>
                {statusLabels[contract.status] ?? contract.status}
              </Badge>
              <Badge className="text-xs font-semibold rounded-lg bg-[#F1F5F9] text-[#334155] px-2.5 py-1">{contract.contractType}</Badge>
              {contract.industry && <Badge className="text-xs rounded-lg bg-[#EDE9FE] text-[#7C3AED] px-2.5 py-1">{contract.industry}</Badge>}
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
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden">
            <Tabs defaultValue="overview">
              <div className="px-4 pt-4">
                <TabsList className="flex-wrap">
                  <TabsTrigger value="overview">סקירה</TabsTrigger>
                  <TabsTrigger value="document">מסמך חוזה</TabsTrigger>
                  <TabsTrigger value="export">ייצוא</TabsTrigger>
                  <TabsTrigger value="ai">בינה חוזית</TabsTrigger>
                  <TabsTrigger value="versions">גרסאות ({contract.versions.length})</TabsTrigger>
                  <TabsTrigger value="approvals">אישורים ({contract.approvals.length})</TabsTrigger>
                  <TabsTrigger value="obligations">התחייבויות ({contract.obligations.length})</TabsTrigger>
                  <TabsTrigger value="reminders">תזכורות ({contract.renewalReminders.length})</TabsTrigger>
                  <TabsTrigger value="comments">הערות ({contract.comments.length})</TabsTrigger>
                  <TabsTrigger value="audit">יומן ({contract.auditLogs.length})</TabsTrigger>
                  <TabsTrigger value="attachments">קבצים ({contract.attachments.length})</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A]">פרטי החוזה</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow label="כותרת" value={contract.title} />
                  <InfoRow label="סטטוס" value={statusLabels[contract.status]} />
                  <InfoRow label="סוג חוזה" value={contract.contractType} />
                  <InfoRow label="תעשייה" value={contract.industry ?? "—"} />
                  <InfoRow label="שווי" value={formatCurrency(contract.amount ? Number(contract.amount) : null, contract.currency)} />
                  <InfoRow label="מטבע" value={contract.currency} />
                  <InfoRow label="תאריך התחלה" value={formatDate(contract.startDate)} />
                  <InfoRow label="תאריך סיום" value={formatDate(contract.endDate)} />
                  <InfoRow label="תאריך חידוש" value={formatDate(contract.renewalDate)} />
                  <InfoRow label="ימי הודעה מראש לביטול" value={contract.cancellationNoticeDays?.toString() ?? "—"} />
                  <InfoRow label="אחראי פנימי" value={contract.internalOwner?.fullName ?? "—"} />
                </div>
              </TabsContent>

              <TabsContent value="document" className="p-6">
                {(() => {
                  const latestVersion = contract.versions[0]
                  if (!latestVersion) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-[#E2E8F0]">
                        <p className="text-sm text-[#94A3B8] font-medium">אין גרסאות מסמך עדיין</p>
                      </div>
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
                      <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-[#E2E8F0]">
                        <p className="text-sm text-[#94A3B8] font-medium">אין גרסאות מסמך לייצוא</p>
                      </div>
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
                  <h3 className="text-sm font-bold text-[#0F172A]">גרסאות חוזה</h3>
                  <CreateVersionButton contractId={contract.id} />
                </div>
                {contract.versions.length === 0 ? (
                  <EmptyState text="אין גרסאות עדיין" />
                ) : (
                  <div className="space-y-3">
                    {contract.versions.map((version) => (
                      <div key={version.id} className="rounded-xl border border-[#E2E8F0] p-4 hover:bg-[#F8FAFC] transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="text-[10px] font-bold rounded-lg bg-[#DBEAFE] text-[#2563EB]">v{version.versionNumber}</Badge>
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
                  <h3 className="text-sm font-bold text-[#0F172A]">בקשות אישור</h3>
                  <RequestApprovalButton contractId={contract.id} users={users} />
                </div>
                {contract.approvals.length === 0 ? (
                  <EmptyState text="אין בקשות אישור" />
                ) : (
                  <div className="space-y-3">
                    {contract.approvals.map((approval) => (
                      <div key={approval.id} className="rounded-xl border border-[#E2E8F0] p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A]">{approval.approvalType}</p>
                            <p className="text-xs text-[#64748B]">מאשר: {approval.approver?.fullName ?? "—"}</p>
                            {approval.requestedBy && <p className="text-xs text-[#94A3B8]">מבקש: {approval.requestedBy.fullName}</p>}
                          </div>
                          <div className="text-left space-y-1">
                            <Badge className={`text-[10px] font-bold rounded-lg ${approval.status === "APPROVED" ? "bg-[#DCFCE7] text-[#16A34A]" : approval.status === "REJECTED" ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-[#FEF3C7] text-[#D97706]"}`}>
                              {approval.status === "PENDING" ? "ממתין" : approval.status === "APPROVED" ? "אושר" : "נדחה"}
                            </Badge>
                            <p className="text-xs text-[#94A3B8]">{formatDate(approval.createdAt)}</p>
                          </div>
                        </div>
                        {approval.note && (
                          <p className="mt-2 text-sm text-[#64748B] border-r-2 border-[#DBEAFE] pr-3">{approval.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="obligations" className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0F172A]">התחייבויות</h3>
                  <CreateObligationButton contractId={contract.id} users={users} />
                </div>
                {contract.obligations.length === 0 ? (
                  <EmptyState text="אין התחייבויות" />
                ) : (
                  <div className="space-y-3">
                    {contract.obligations.map((ob) => {
                      const isOverdue = ob.dueDate && new Date(ob.dueDate) < new Date() && ob.status !== "COMPLETED"
                      const priorityColors: Record<string, string> = { LOW: "bg-[#F1F5F9] text-[#64748B]", MEDIUM: "bg-[#DBEAFE] text-[#2563EB]", HIGH: "bg-[#FEF3C7] text-[#D97706]", CRITICAL: "bg-[#FEE2E2] text-[#DC2626]" }
                      const priorityLabels: Record<string, string> = { LOW: "נמוך", MEDIUM: "בינוני", HIGH: "גבוה", CRITICAL: "קריטי" }
                      return (
                        <div key={ob.id} className={`rounded-xl border p-4 ${isOverdue ? "border-red-200" : "border-[#E2E8F0]"}`}>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-[#0F172A]">{ob.title}</p>
                                <Badge className={`text-[10px] font-bold rounded-lg ${priorityColors[ob.priority]}`}>
                                  {priorityLabels[ob.priority]}
                                </Badge>
                              </div>
                              {ob.description && <p className="text-xs text-[#64748B]">{ob.description}</p>}
                              <div className="flex flex-wrap gap-3 text-xs text-[#94A3B8]">
                                <span>סוג: {ob.obligationType}</span>
                                {ob.dueDate && <span className={isOverdue ? "text-[#DC2626] font-semibold" : ""}>יעד: {formatDate(ob.dueDate)}</span>}
                                {ob.owner && <span>אחראי: {ob.owner.fullName}</span>}
                                {ob.department && <span>מחלקה: {ob.department.name}</span>}
                                {ob.triggerType && <span>טריגר: {ob.triggerType}</span>}
                                <span>מקור: {ob.source === "ai" ? "AI" : ob.source === "template" ? "תבנית" : "ידני"}</span>
                              </div>
                            </div>
                            <Badge className={`text-[10px] font-bold rounded-lg shrink-0 ${isOverdue ? "bg-[#FEE2E2] text-[#DC2626]" : ob.status === "COMPLETED" ? "bg-[#DCFCE7] text-[#16A34A]" : ob.status === "IN_PROGRESS" ? "bg-[#DBEAFE] text-[#2563EB]" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                              {isOverdue ? "באיחור" : ob.status === "OPEN" ? "פתוח" : ob.status === "IN_PROGRESS" ? "בתהליך" : ob.status === "COMPLETED" ? "הושלם" : "באיחור"}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reminders" className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0F172A]">תזכורות חידוש</h3>
                  <CreateReminderButton contractId={contract.id} />
                </div>
                {contract.renewalReminders.length === 0 ? (
                  <EmptyState text="אין תזכורות" />
                ) : (
                  <div className="space-y-3">
                    {contract.renewalReminders.map((reminder) => (
                      <div key={reminder.id} className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-4">
                        <div className="flex items-center gap-3">
                          <Clock className="size-4 text-[#D97706]" />
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A]">{reminder.reminderType}</p>
                            <p className="text-xs text-[#94A3B8]">{formatDate(reminder.reminderDate)}</p>
                          </div>
                        </div>
                        <Badge className={`text-[10px] font-bold rounded-lg ${reminder.status === "COMPLETED" ? "bg-[#DCFCE7] text-[#16A34A]" : reminder.status === "SENT" ? "bg-[#DBEAFE] text-[#2563EB]" : "bg-[#FEF3C7] text-[#D97706]"}`}>
                          {reminder.status === "SCHEDULED" ? "מתוזמן" : reminder.status === "SENT" ? "נשלח" : reminder.status === "DISMISSED" ? "בוטל" : "הושלם"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="p-6 space-y-4">
                {contract.comments.length === 0 ? (
                  <p className="text-sm text-[#94A3B8] text-center py-8">אין הערות עדיין</p>
                ) : (
                  <div className="space-y-3">
                    {contract.comments.map((comment) => (
                      <div key={comment.id} className="rounded-xl border border-[#E2E8F0] p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-[#F1F5F9] text-[10px] font-bold text-[#64748B]">
                              {comment.authorName[0]}
                            </div>
                            <span className="text-sm font-semibold text-[#0F172A]">{comment.authorName}</span>
                            <Badge className={`text-[10px] rounded-lg ${comment.visibility === "INTERNAL" ? "bg-[#F1F5F9] text-[#64748B]" : "bg-[#DBEAFE] text-[#2563EB]"}`}>
                              {comment.visibility === "INTERNAL" ? "פנימי" : "לקוח"}
                            </Badge>
                          </div>
                          <span className="text-xs text-[#94A3B8]">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="mt-2 text-sm text-[#334155]">{comment.body}</p>
                      </div>
                    ))}
                  </div>
                )}
                <AddCommentForm contractId={contract.id} />
              </TabsContent>

              <TabsContent value="audit" className="p-6">
                {contract.auditLogs.length === 0 ? (
                  <EmptyState text="אין רשומות ביומן" />
                ) : (
                  <div className="relative space-y-0">
                    <div className="absolute start-[11px] top-2 bottom-2 w-px bg-[#E2E8F0]" />
                    {contract.auditLogs.map((log) => (
                      <div key={log.id} className="relative flex gap-4 pb-4">
                        <div className="relative z-10 mt-1.5">
                          <div className="size-[10px] rounded-full bg-[#2563EB] ring-4 ring-white" />
                        </div>
                        <div className="flex-1 rounded-xl border border-[#E2E8F0] p-3 bg-[#F8FAFC]">
                          <div className="flex items-center justify-between">
                            <Badge className="text-[10px] font-bold rounded-lg bg-[#DBEAFE] text-[#2563EB]">{translateAction(log.action)}</Badge>
                            <span className="text-[10px] text-[#94A3B8]">{formatDate(log.createdAt)}</span>
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
                  <h3 className="text-sm font-bold text-[#0F172A]">קבצים מצורפים</h3>
                  <Button variant="outline" size="sm" disabled className="rounded-xl">
                    <Upload className="size-4 ml-1" />
                    העלאת קובץ
                  </Button>
                </div>
                {contract.attachments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] py-12">
                    <Upload className="size-8 text-[#94A3B8] mb-3" />
                    <p className="text-sm text-[#64748B] font-medium">אין קבצים מצורפים</p>
                    <p className="text-xs text-[#94A3B8] mt-1">העלאת קבצים תתווסף בשלב הבא</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contract.attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-[#F1F5F9] p-2">
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

        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
            <h3 className="text-sm font-bold text-[#0F172A] mb-4">חברה ואיש קשר</h3>
            <div className="space-y-3">
              <InfoRow label="שם חברה" value={contract.company?.name ?? "—"} />
              <InfoRow label="מספר רישום" value={contract.company?.registrationNumber ?? "—"} />
              <InfoRow label="כתובת" value={contract.company?.address ?? "—"} />
              {contract.contact && (
                <>
                  <div className="h-px bg-[#E2E8F0] my-3" />
                  <InfoRow label="איש קשר" value={contract.contact.fullName} />
                  <InfoRow label="אימייל" value={contract.contact.email ?? "—"} />
                  <InfoRow label="טלפון" value={contract.contact.phone ?? "—"} />
                  <InfoRow label="תפקיד" value={contract.contact.title ?? "—"} />
                  <InfoRow label="חותם" value={contract.contact.isSignatory ? "כן" : "לא"} />
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
            <h3 className="text-sm font-bold text-[#0F172A] mb-4">ציר זמן</h3>
            <div className="space-y-3">
              <TimelineRow label="נוצר" date={contract.createdAt} />
              <TimelineRow label="עדכון אחרון" date={contract.updatedAt} />
              {contract.startDate && <TimelineRow label="התחלה" date={contract.startDate} />}
              {contract.endDate && <TimelineRow label="סיום" date={contract.endDate} />}
              {contract.renewalDate && <TimelineRow label="חידוש" date={contract.renewalDate} />}
            </div>
          </div>

          {contract.signatureRequests.length > 0 && (
            <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
              <h3 className="text-sm font-bold text-[#0F172A] mb-4">חתימות</h3>
              <div className="space-y-3">
                {contract.signatureRequests.map((sig) => (
                  <div key={sig.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#334155]">{sig.signerEmail}</span>
                      <Badge className={`text-[10px] font-bold rounded-lg ${sig.status === "SIGNED" ? "bg-[#DCFCE7] text-[#16A34A]" : sig.status === "VIEWED" ? "bg-[#DBEAFE] text-[#2563EB]" : sig.status === "DECLINED" ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-[#FEF3C7] text-[#D97706]"}`}>
                        {sig.status === "PENDING" ? "ממתין" : sig.status === "VIEWED" ? "נצפה" : sig.status === "SIGNED" ? "נחתם" : sig.status === "DECLINED" ? "נדחה" : "פג תוקף"}
                      </Badge>
                    </div>
                    {sig.status !== "SIGNED" && sig.status !== "DECLINED" && (
                      <p className="text-[10px] text-[#94A3B8] truncate" dir="ltr">/client-portal/{sig.token}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
            <h3 className="text-sm font-bold text-[#0F172A] mb-4">פעולות מהירות</h3>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#94A3B8] font-medium">{label}</p>
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-[#E2E8F0]">
      <p className="text-sm text-[#94A3B8] font-medium">{text}</p>
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
