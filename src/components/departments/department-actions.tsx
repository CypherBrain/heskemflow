"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createDepartment, assignUserToDepartment } from "@/actions/departments"
import { Plus, UserPlus } from "lucide-react"

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

interface User {
  id: string
  fullName: string
  role: string
}

export function CreateDepartmentButton({ users }: { users: User[] }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [managerId, setManagerId] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!name.trim()) return
    startTransition(async () => {
      await createDepartment({ name: name.trim(), description: description || undefined, managerId: managerId || undefined })
      setName("")
      setDescription("")
      setManagerId("")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="rounded-xl gap-2" />}>
        <Plus className="size-4" />
        מחלקה חדשה
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>יצירת מחלקה</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>שם המחלקה</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: משפטי" />
          </div>
          <div className="space-y-2">
            <Label>תיאור</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="תיאור קצר..." />
          </div>
          <div className="space-y-2">
            <Label>מנהל מחלקה</Label>
            <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className={selectClass}>
              <option value="">בחר מנהל...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()} className="w-full">
            {isPending ? "יוצר..." : "צור מחלקה"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AssignUserButton({
  departmentId,
  departmentName,
  users,
}: {
  departmentId: string
  departmentName: string
  users: User[]
}) {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!userId) return
    startTransition(async () => {
      await assignUserToDepartment(userId, departmentId)
      setUserId("")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="w-full rounded-xl gap-2 text-xs" />}>
        <UserPlus className="size-3.5" />
        שייך משתמש
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>שיוך משתמש ל{departmentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>משתמש</Label>
            <select value={userId} onChange={(e) => setUserId(e.target.value)} className={selectClass}>
              <option value="">בחר משתמש...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
              ))}
            </select>
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !userId} className="w-full">
            {isPending ? "משייך..." : "שייך"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
