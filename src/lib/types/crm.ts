// ─── שלב עסקה ──────────────────────────────────────────────────────────────

/** שלב עסקה במשפך המכירות */
export enum DealStage {
  LEAD = "LEAD",
  QUALIFIED = "QUALIFIED",
  PROPOSAL = "PROPOSAL",
  NEGOTIATION = "NEGOTIATION",
  CLOSED_WON = "CLOSED_WON",
  CLOSED_LOST = "CLOSED_LOST",
}

// ─── ממשקים ────────────────────────────────────────────────────────────────

/** חברה */
export interface Company {
  id: string;
  /** שם החברה */
  name: string;
  /** מספר ח.פ. / רישום */
  registrationNumber: string | null;
  /** כתובת */
  address: string | null;
  /** עיר */
  city: string | null;
  /** מדינה – ברירת מחדל ישראל */
  country: string | null;
  /** טלפון */
  phone: string | null;
  /** אימייל */
  email: string | null;
  /** אתר אינטרנט */
  website: string | null;
  /** ענף */
  industry: string | null;
  organizationId: string;
  organization?: import("./organization").Organization;
  createdAt: Date;
  updatedAt: Date;

  contacts?: Contact[];
  deals?: Deal[];
  contracts?: import("./contracts").Contract[];
}

/** איש קשר */
export interface Contact {
  id: string;
  /** שם פרטי */
  firstName: string;
  /** שם משפחה */
  lastName: string;
  /** אימייל */
  email: string | null;
  /** טלפון */
  phone: string | null;
  /** תפקיד */
  role: string | null;
  companyId: string;
  company?: Company;
  organizationId: string;
  organization?: import("./organization").Organization;
  createdAt: Date;
  updatedAt: Date;

  deals?: Deal[];
  contracts?: import("./contracts").Contract[];
}

/** עסקה */
export interface Deal {
  id: string;
  /** כותרת העסקה */
  title: string;
  /** ערך כספי */
  value: number;
  /** מטבע – ברירת מחדל ש"ח */
  currency: string;
  /** שלב בתהליך */
  stage: DealStage;
  companyId: string;
  company?: Company;
  contactId: string | null;
  contact?: Contact | null;
  organizationId: string;
  organization?: import("./organization").Organization;
  /** מזהה בעל העסקה */
  ownerId: string;
  owner?: import("./organization").User;
  /** תאריך סגירה צפוי */
  expectedCloseDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  contracts?: import("./contracts").Contract[];
}

/** אינטגרציית CRM */
export interface CrmIntegration {
  id: string;
  /** שם הספק – למשל HubSpot, Salesforce */
  provider: string;
  /** הגדרות חיבור */
  config: Record<string, unknown>;
  /** האם פעיל */
  isActive: boolean;
  organizationId: string;
  organization?: import("./organization").Organization;
  /** סנכרון אחרון */
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
