import type { ContractStatus } from "@prisma/client"

export const statusLabels: Record<ContractStatus, string> = {
  DRAFT: "טיוטה",
  INTERNAL_REVIEW: "בדיקה פנימית",
  LEGAL_REVIEW: "בדיקה משפטית",
  CLIENT_REVIEW: "בדיקת לקוח",
  CHANGES_REQUESTED: "נדרשים שינויים",
  APPROVED: "מאושר",
  SENT_FOR_SIGNATURE: "נשלח לחתימה",
  SIGNED: "חתום",
  ACTIVE: "פעיל",
  EXPIRED: "פג תוקף",
  TERMINATED: "בוטל",
}

export const statusColors: Record<ContractStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  INTERNAL_REVIEW: "bg-yellow-50 text-yellow-700",
  LEGAL_REVIEW: "bg-orange-50 text-orange-700",
  CLIENT_REVIEW: "bg-blue-50 text-blue-700",
  CHANGES_REQUESTED: "bg-amber-50 text-amber-700",
  APPROVED: "bg-indigo-50 text-indigo-700",
  SENT_FOR_SIGNATURE: "bg-purple-50 text-purple-700",
  SIGNED: "bg-green-50 text-green-700",
  ACTIVE: "bg-green-100 text-green-800",
  EXPIRED: "bg-red-50 text-red-700",
  TERMINATED: "bg-red-100 text-red-800",
}

export function formatCurrency(value: number | null | undefined, currency = "ILS"): string {
  if (value == null) return "—"
  if (currency === "ILS") {
    return `₪${Number(value).toLocaleString("he-IL")}`
  }
  return Number(value).toLocaleString("he-IL", { style: "currency", currency })
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return "—"
  return date.toLocaleDateString("he-IL")
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < 0) return `לפני ${Math.abs(diffDays)} ימים`
  if (diffDays === 0) return "היום"
  if (diffDays === 1) return "מחר"
  if (diffDays <= 7) return `בעוד ${diffDays} ימים`
  if (diffDays <= 30) return `בעוד ${Math.ceil(diffDays / 7)} שבועות`
  return formatDate(date)
}
