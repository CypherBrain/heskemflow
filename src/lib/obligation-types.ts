export interface ObligationTypeDefinition {
  slug: string
  hebrewName: string
  defaultDepartment: string | null
  defaultPriority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  defaultNotifyBeforeDays: number
}

export const OBLIGATION_TYPES: ObligationTypeDefinition[] = [
  { slug: "payment", hebrewName: "תשלום", defaultDepartment: "כספים", defaultPriority: "HIGH", defaultNotifyBeforeDays: 7 },
  { slug: "renewal", hebrewName: "חידוש", defaultDepartment: "משפטי", defaultPriority: "HIGH", defaultNotifyBeforeDays: 30 },
  { slug: "cancellation_notice", hebrewName: "הודעת ביטול", defaultDepartment: "משפטי", defaultPriority: "CRITICAL", defaultNotifyBeforeDays: 14 },
  { slug: "deliverable", hebrewName: "מסירת תוצר", defaultDepartment: "תפעול", defaultPriority: "HIGH", defaultNotifyBeforeDays: 7 },
  { slug: "internal_approval", hebrewName: "אישור פנימי", defaultDepartment: "הנהלה", defaultPriority: "MEDIUM", defaultNotifyBeforeDays: 3 },
  { slug: "signature", hebrewName: "חתימה", defaultDepartment: "משפטי", defaultPriority: "HIGH", defaultNotifyBeforeDays: 3 },
  { slug: "missing_document", hebrewName: "מסמך חסר", defaultDepartment: null, defaultPriority: "MEDIUM", defaultNotifyBeforeDays: 7 },
  { slug: "legal_review", hebrewName: "בדיקה משפטית", defaultDepartment: "משפטי", defaultPriority: "MEDIUM", defaultNotifyBeforeDays: 7 },
  { slug: "financial_review", hebrewName: "בדיקת כספים", defaultDepartment: "כספים", defaultPriority: "MEDIUM", defaultNotifyBeforeDays: 7 },
  { slug: "security_review", hebrewName: "בדיקת אבטחת מידע", defaultDepartment: "אבטחת מידע", defaultPriority: "HIGH", defaultNotifyBeforeDays: 14 },
  { slug: "sla", hebrewName: "SLA", defaultDepartment: "תפעול", defaultPriority: "HIGH", defaultNotifyBeforeDays: 3 },
  { slug: "support", hebrewName: "תמיכה", defaultDepartment: "שירות לקוחות", defaultPriority: "MEDIUM", defaultNotifyBeforeDays: 3 },
  { slug: "maintenance", hebrewName: "תחזוקה", defaultDepartment: "תפעול", defaultPriority: "MEDIUM", defaultNotifyBeforeDays: 7 },
  { slug: "reporting", hebrewName: "דיווח", defaultDepartment: null, defaultPriority: "LOW", defaultNotifyBeforeDays: 3 },
  { slug: "confidentiality", hebrewName: "סודיות", defaultDepartment: "משפטי", defaultPriority: "MEDIUM", defaultNotifyBeforeDays: 30 },
  { slug: "ip", hebrewName: "קניין רוחני", defaultDepartment: "משפטי", defaultPriority: "HIGH", defaultNotifyBeforeDays: 14 },
  { slug: "compliance", hebrewName: "רגולציה / ציות", defaultDepartment: "משפטי", defaultPriority: "CRITICAL", defaultNotifyBeforeDays: 14 },
  { slug: "insurance", hebrewName: "ביטוח", defaultDepartment: "כספים", defaultPriority: "HIGH", defaultNotifyBeforeDays: 30 },
  { slug: "warranty", hebrewName: "ערבות", defaultDepartment: "כספים", defaultPriority: "HIGH", defaultNotifyBeforeDays: 14 },
  { slug: "other", hebrewName: "אחר", defaultDepartment: null, defaultPriority: "LOW", defaultNotifyBeforeDays: 7 },
]

export const OBLIGATION_TYPE_MAP = new Map(
  OBLIGATION_TYPES.map((t) => [t.slug, t])
)

export function getObligationTypeOptions() {
  return OBLIGATION_TYPES.map((t) => ({
    value: t.slug,
    label: t.hebrewName,
  }))
}
