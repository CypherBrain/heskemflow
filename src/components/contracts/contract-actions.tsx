"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  updateContractStatus,
  createVersion,
  requestApproval,
  addComment,
  createObligation,
  createRenewalReminderForContract,
} from "@/actions/contracts"
import { createSignatureRequest } from "@/actions/client-portal"
import type { ContractStatus } from "@prisma/client"
import { statusLabels } from "@/lib/contract-utils"

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

interface User {
  id: string
  fullName: string
  role: string
}

// -- Status Update --
export function StatusUpdateButton({
  contractId,
  currentStatus,
}: {
  contractId: string
  currentStatus: ContractStatus
}) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<string>(currentStatus)
  const [isPending, startTransition] = useTransition()

  const allStatuses: ContractStatus[] = [
    "DRAFT", "INTERNAL_REVIEW", "LEGAL_REVIEW", "CLIENT_REVIEW",
    "CHANGES_REQUESTED", "APPROVED", "SENT_FOR_SIGNATURE", "SIGNED",
    "ACTIVE", "EXPIRED", "TERMINATED",
  ]

  function handleSubmit() {
    if (status === currentStatus) return
    startTransition(async () => {
      await updateContractStatus(contractId, status as ContractStatus)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        עדכן סטטוס
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>עדכון סטטוס חוזה</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>סטטוס חדש</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
              {allStatuses.map((s) => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleSubmit} disabled={isPending || status === currentStatus} className="w-full">
            {isPending ? "שומר..." : "שמור"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// -- Create Version --
export function CreateVersionButton({ contractId }: { contractId: string }) {
  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!summary.trim()) return
    startTransition(async () => {
      await createVersion({ contractId, changeSummary: summary.trim() })
      setSummary("")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        גרסה חדשה
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>יצירת גרסה חדשה</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>תיאור השינויים</Label>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="מה השתנה בגרסה זו?" />
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !summary.trim()} className="w-full">
            {isPending ? "שומר..." : "צור גרסה"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// -- Request Approval --
export function RequestApprovalButton({
  contractId,
  users,
}: {
  contractId: string
  users: User[]
}) {
  const [open, setOpen] = useState(false)
  const [approverId, setApproverId] = useState("")
  const [approvalType, setApprovalType] = useState("")
  const [note, setNote] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!approvalType) return
    startTransition(async () => {
      await requestApproval({ contractId, approverId, approvalType, note })
      setApproverId("")
      setApprovalType("")
      setNote("")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        בקשת אישור
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>בקשת אישור</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>סוג אישור</Label>
            <select value={approvalType} onChange={(e) => setApprovalType(e.target.value)} className={selectClass}>
              <option value="">בחר סוג</option>
              <option value="legal">משפטי</option>
              <option value="financial">פיננסי</option>
              <option value="management">ניהולי</option>
              <option value="compliance">תאימות</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>מאשר</Label>
            <select value={approverId} onChange={(e) => setApproverId(e.target.value)} className={selectClass}>
              <option value="">בחר מאשר</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>הערה</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="הערה אופציונלית..." />
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !approvalType} className="w-full">
            {isPending ? "שולח..." : "שלח בקשה"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// -- Create Obligation --
export function CreateObligationButton({
  contractId,
  users,
}: {
  contractId: string
  users: User[]
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [obligationType, setObligationType] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [ownerId, setOwnerId] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!title.trim() || !obligationType) return
    startTransition(async () => {
      await createObligation({
        contractId,
        title: title.trim(),
        description: description || undefined,
        obligationType,
        dueDate: dueDate || undefined,
        ownerId: ownerId || undefined,
      })
      setTitle("")
      setDescription("")
      setObligationType("")
      setDueDate("")
      setOwnerId("")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        התחייבות חדשה
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>יצירת התחייבות</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>כותרת</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="כותרת ההתחייבות" />
          </div>
          <div className="space-y-2">
            <Label>תיאור</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="תיאור..." />
          </div>
          <div className="space-y-2">
            <Label>סוג</Label>
            <select value={obligationType} onChange={(e) => setObligationType(e.target.value)} className={selectClass}>
              <option value="">בחר סוג</option>
              <option value="payment">תשלום</option>
              <option value="delivery">אספקה</option>
              <option value="compliance">תאימות</option>
              <option value="reporting">דיווח</option>
              <option value="other">אחר</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>תאריך יעד</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>אחראי</Label>
            <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className={selectClass}>
              <option value="">בחר אחראי</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !title.trim() || !obligationType} className="w-full">
            {isPending ? "שומר..." : "צור התחייבות"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// -- Create Renewal Reminder --
export function CreateReminderButton({ contractId }: { contractId: string }) {
  const [open, setOpen] = useState(false)
  const [reminderDate, setReminderDate] = useState("")
  const [reminderType, setReminderType] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!reminderDate || !reminderType) return
    startTransition(async () => {
      await createRenewalReminderForContract({ contractId, reminderDate, reminderType })
      setReminderDate("")
      setReminderType("")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        תזכורת חדשה
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>יצירת תזכורת חידוש</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>תאריך תזכורת</Label>
            <Input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>סוג</Label>
            <select value={reminderType} onChange={(e) => setReminderType(e.target.value)} className={selectClass}>
              <option value="">בחר סוג</option>
              <option value="RENEWAL">חידוש</option>
              <option value="EXPIRY">פקיעה</option>
              <option value="REVIEW">סקירה</option>
              <option value="CANCELLATION">ביטול</option>
            </select>
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !reminderDate || !reminderType} className="w-full">
            {isPending ? "שומר..." : "צור תזכורת"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// -- Send for Signature --
export function SendForSignatureButton({
  contractId,
  contacts,
}: {
  contractId: string
  contacts: { id: string; fullName: string; email?: string | null }[]
}) {
  const [open, setOpen] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState("")
  const [signerEmail, setSignerEmail] = useState("")
  const [portalLink, setPortalLink] = useState("")
  const [isPending, startTransition] = useTransition()

  const selectedContact = contacts.find((c) => c.id === selectedContactId)

  function handleContactChange(contactId: string) {
    setSelectedContactId(contactId)
    const contact = contacts.find((c) => c.id === contactId)
    if (contact?.email) setSignerEmail(contact.email)
  }

  function handleSubmit() {
    if (!signerEmail.trim()) return
    startTransition(async () => {
      const result = await createSignatureRequest({
        contractId,
        signerContactId: selectedContactId || undefined,
        signerEmail: signerEmail.trim(),
      })
      const base = typeof window !== "undefined" ? window.location.origin : ""
      setPortalLink(`${base}/client-portal/${result.token}`)
    })
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(portalLink)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setPortalLink(""); setSelectedContactId(""); setSignerEmail("") } }}>
      <DialogTrigger render={<Button size="sm" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white" />}>
        שלח לחתימה
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>שליחה לחתימת לקוח</DialogTitle>
        </DialogHeader>
        {portalLink ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center space-y-2">
              <p className="text-sm font-semibold text-emerald-800">הקישור נוצר בהצלחה!</p>
              <p className="text-xs text-emerald-600">שלח את הקישור ללקוח לצפייה וחתימה</p>
            </div>
            <div className="flex gap-2">
              <Input value={portalLink} readOnly className="text-xs" dir="ltr" />
              <Button onClick={handleCopyLink} variant="outline" size="sm" className="shrink-0">
                העתק
              </Button>
            </div>
            <Button onClick={() => { setOpen(false); setPortalLink("") }} variant="outline" className="w-full">
              סגור
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>איש קשר</Label>
              <select
                value={selectedContactId}
                onChange={(e) => handleContactChange(e.target.value)}
                className={selectClass}
              >
                <option value="">בחר איש קשר...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName} {c.email ? `(${c.email})` : ""}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>אימייל החותם *</Label>
              <Input
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="email@example.com"
                type="email"
                dir="ltr"
              />
            </div>
            <Button onClick={handleSubmit} disabled={isPending || !signerEmail.trim()} className="w-full bg-[#7C3AED] hover:bg-[#6D28D9]">
              {isPending ? "יוצר קישור..." : "צור קישור חתימה"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// -- Add Comment --
export function AddCommentForm({ contractId }: { contractId: string }) {
  const [authorName, setAuthorName] = useState("")
  const [visibility, setVisibility] = useState<"INTERNAL" | "CLIENT">("INTERNAL")
  const [body, setBody] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || !authorName.trim()) return
    startTransition(async () => {
      await addComment({ contractId, authorName: authorName.trim(), visibility, body: body.trim() })
      setBody("")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">שם</Label>
          <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="שם הכותב" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">נראות</Label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as "INTERNAL" | "CLIENT")} className={selectClass}>
            <option value="INTERNAL">פנימי</option>
            <option value="CLIENT">לקוח</option>
          </select>
        </div>
      </div>
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="כתוב הערה..." rows={3} />
      <Button type="submit" size="sm" disabled={isPending || !body.trim() || !authorName.trim()}>
        {isPending ? "שומר..." : "הוסף הערה"}
      </Button>
    </form>
  )
}
