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
  "flex h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm shadow-none outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"

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
      <DialogTrigger render={<Button size="sm" className="rounded-xl gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] font-semibold shadow-md shadow-blue-500/15 transition-all duration-200" />}>
        <Plus className="size-4" />
        מחלקה חדשה
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">יצירת מחלקה</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#334155]">שם המחלקה</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: משפטי" className="rounded-xl h-10 border-[#E2E8F0] focus:border-[#2563EB]" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#334155]">תיאור</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="תיאור קצר של תחומי האחריות..." className="rounded-xl border-[#E2E8F0] focus:border-[#2563EB]" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#334155]">מנהל מחלקה</Label>
            <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className={selectClass}>
              <option value="">בחר מנהל...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()} className="w-full rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] font-semibold shadow-md shadow-blue-500/15 h-11 transition-all duration-200">
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
      <DialogTrigger render={<Button variant="outline" size="sm" className="w-full rounded-xl gap-2 text-xs border-[#E2E8F0] hover:border-[#DBEAFE] hover:bg-[#F8FAFC] font-medium transition-all duration-200" />}>
        <UserPlus className="size-3.5" />
        הוסף אחראי
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">שיוך משתמש ל{departmentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#334155]">משתמש</Label>
            <select value={userId} onChange={(e) => setUserId(e.target.value)} className={selectClass}>
              <option value="">בחר משתמש...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
              ))}
            </select>
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !userId} className="w-full rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] font-semibold shadow-md shadow-blue-500/15 h-11 transition-all duration-200">
            {isPending ? "משייך..." : "שייך למחלקה"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
