// ─── סטטוסים וסוגי חוזים ───────────────────────────────────────────────────

/** סטטוס חוזה – מחזור החיים המלא */
export enum ContractStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  SENT_TO_CLIENT = "SENT_TO_CLIENT",
  CLIENT_REVIEWING = "CLIENT_REVIEWING",
  CHANGE_REQUESTED = "CHANGE_REQUESTED",
  PENDING_SIGNATURE = "PENDING_SIGNATURE",
  SIGNED = "SIGNED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

/** סוג חוזה */
export enum ContractType {
  SERVICE = "SERVICE",
  NDA = "NDA",
  EMPLOYMENT = "EMPLOYMENT",
  LEASE = "LEASE",
  VENDOR = "VENDOR",
  PARTNERSHIP = "PARTNERSHIP",
  CUSTOM = "CUSTOM",
}

/** סטטוס אישור */
export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

/** סטטוס חתימה */
export enum SignatureStatus {
  PENDING = "PENDING",
  VIEWED = "VIEWED",
  SIGNED = "SIGNED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED",
}

/** סטטוס התחייבות */
export enum ObligationStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  OVERDUE = "OVERDUE",
}

/** סטטוס תזכורת חידוש */
export enum ReminderStatus {
  SCHEDULED = "SCHEDULED",
  SENT = "SENT",
  ACKNOWLEDGED = "ACKNOWLEDGED",
  DISMISSED = "DISMISSED",
}

// ─── ממשקים ────────────────────────────────────────────────────────────────

/** חוזה */
export interface Contract {
  id: string;
  /** כותרת החוזה */
  title: string;
  /** מספר חוזה ייחודי */
  contractNumber: string;
  status: ContractStatus;
  type: ContractType;
  /** ערך כספי */
  value: number | null;
  /** מטבע – ברירת מחדל ש"ח */
  currency: string | null;
  /** תאריך תחילה */
  startDate: Date | null;
  /** תאריך סיום */
  endDate: Date | null;
  /** מזהה חברה */
  companyId: string;
  company?: import("./crm").Company;
  /** מזהה איש קשר */
  contactId: string | null;
  contact?: import("./crm").Contact | null;
  /** מזהה עסקה */
  dealId: string | null;
  deal?: import("./crm").Deal | null;
  /** מזהה תבנית */
  templateId: string | null;
  template?: ContractTemplate | null;
  /** מזהה ארגון */
  organizationId: string;
  organization?: import("./organization").Organization;
  /** מזהה יוצר החוזה */
  createdById: string;
  createdBy?: import("./organization").User;
  /** מזהה גרסה נוכחית */
  currentVersionId: string | null;
  currentVersion?: ContractVersion | null;
  /** תאריך חתימה */
  signedAt: Date | null;
  /** קישור למסמך חתום */
  signedDocumentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  versions?: ContractVersion[];
  approvalRequests?: ApprovalRequest[];
  signatureRequests?: SignatureRequest[];
  obligations?: ContractObligation[];
  renewalReminders?: RenewalReminder[];
}

/** גרסת חוזה */
export interface ContractVersion {
  id: string;
  contractId: string;
  /** מספר גרסה */
  versionNumber: number;
  /** תוכן החוזה */
  content: string;
  /** תיאור השינויים */
  changes: string | null;
  createdById: string;
  createdBy?: import("./organization").User;
  createdAt: Date;
}

/** תבנית חוזה */
export interface ContractTemplate {
  id: string;
  /** שם התבנית */
  name: string;
  /** תיאור */
  description: string | null;
  /** תוכן התבנית */
  content: string;
  type: ContractType;
  /** ענף רלוונטי */
  industry: string | null;
  /** האם פעילה */
  isActive: boolean;
  organizationId: string;
  organization?: import("./organization").Organization;
  createdById: string;
  createdBy?: import("./organization").User;
  createdAt: Date;
  updatedAt: Date;
}

/** ספריית סעיפים */
export interface ClauseLibrary {
  id: string;
  /** כותרת הסעיף */
  title: string;
  /** תוכן הסעיף */
  content: string;
  /** קטגוריה */
  category: string;
  /** תגיות */
  tags: string[];
  /** האם גלובלי – זמין לכל הארגונים */
  isGlobal: boolean;
  organizationId: string;
  organization?: import("./organization").Organization;
  createdById: string;
  createdBy?: import("./organization").User;
  createdAt: Date;
  updatedAt: Date;
}

/** בקשת אישור */
export interface ApprovalRequest {
  id: string;
  contractId: string;
  contract?: Contract;
  /** מזהה המבקש */
  requestedById: string;
  requestedBy?: import("./organization").User;
  /** מזהה המאשר */
  approverId: string;
  approver?: import("./organization").User;
  status: ApprovalStatus;
  /** הערות */
  comments: string | null;
  /** תאריך מענה */
  respondedAt: Date | null;
  createdAt: Date;
}

/** בקשת חתימה */
export interface SignatureRequest {
  id: string;
  contractId: string;
  contract?: Contract;
  /** אימייל החותם */
  signerEmail: string;
  /** שם החותם */
  signerName: string;
  /** תפקיד החותם */
  signerRole: string | null;
  status: SignatureStatus;
  /** תאריך חתימה */
  signedAt: Date | null;
  /** מזהה חיצוני – לספק חתימות */
  externalId: string | null;
  /** טוקן גישה ייחודי */
  token: string;
  /** תאריך תפוגה */
  expiresAt: Date;
  createdAt: Date;
}

/** התחייבות חוזית */
export interface ContractObligation {
  id: string;
  contractId: string;
  contract?: Contract;
  /** כותרת ההתחייבות */
  title: string;
  /** תיאור */
  description: string | null;
  /** תאריך יעד */
  dueDate: Date;
  status: ObligationStatus;
  /** מזהה האחראי */
  assigneeId: string | null;
  assignee?: import("./organization").User | null;
  organizationId: string;
  organization?: import("./organization").Organization;
  createdAt: Date;
  updatedAt: Date;
}

/** תזכורת חידוש חוזה */
export interface RenewalReminder {
  id: string;
  contractId: string;
  contract?: Contract;
  /** תאריך תזכורת */
  reminderDate: Date;
  /** תאריך שליחת התזכורת */
  notifiedAt: Date | null;
  status: ReminderStatus;
  organizationId: string;
  organization?: import("./organization").Organization;
  createdAt: Date;
}
