import type { Company, Contact, Deal } from "./crm";
import type { SignatureRequest } from "./contracts";

// ─── ספק CRM ──────────────────────────────────────────────────────────────

/** ממשק ספק CRM – לחיבור מערכות כמו HubSpot, Salesforce, Monday */
export interface CRMProvider {
  /** שליפת עסקאות מה-CRM */
  fetchDeals(organizationId: string): Promise<Deal[]>;
  /** שליפת חברות */
  fetchCompanies(organizationId: string): Promise<Company[]>;
  /** שליפת אנשי קשר */
  fetchContacts(organizationId: string): Promise<Contact[]>;
  /** סנכרון דו-כיווני */
  syncData(organizationId: string): Promise<SyncResult>;
}

export interface SyncResult {
  success: boolean;
  /** מספר רשומות שעודכנו */
  recordsSynced: number;
  /** שגיאות אם היו */
  errors: SyncError[];
  syncedAt: Date;
}

export interface SyncError {
  entityType: string;
  entityId: string;
  message: string;
}

// ─── ספק חתימות דיגיטליות ─────────────────────────────────────────────────

/** ממשק ספק חתימות – לחיבור שירותים כמו DocuSign, SignNow */
export interface SignatureProvider {
  /** יצירת בקשת חתימה חדשה */
  createSignatureRequest(
    contractId: string,
    signers: SignerInfo[]
  ): Promise<SignatureRequestResult>;
  /** בדיקת סטטוס חתימה */
  getSignatureStatus(externalId: string): Promise<SignatureStatusResult>;
  /** ביטול בקשת חתימה */
  cancelSignatureRequest(externalId: string): Promise<void>;
  /** הורדת המסמך החתום */
  getSignedDocument(externalId: string): Promise<SignedDocumentResult>;
}

export interface SignerInfo {
  email: string;
  name: string;
  role?: string;
}

export interface SignatureRequestResult {
  /** מזהה חיצוני מהספק */
  externalId: string;
  /** קישורי חתימה לכל חותם */
  signingUrls: Record<string, string>;
}

export interface SignatureStatusResult {
  status: "pending" | "viewed" | "signed" | "declined" | "expired";
  signers: {
    email: string;
    status: "pending" | "signed" | "declined";
    signedAt?: Date;
  }[];
}

export interface SignedDocumentResult {
  /** URL למסמך החתום */
  documentUrl: string;
  /** תוכן המסמך כ-Buffer */
  documentBuffer?: Buffer;
}

// ─── ספק אחסון קבצים ──────────────────────────────────────────────────────

/** ממשק ספק אחסון – לחיבור שירותים כמו S3, GCS, Azure Blob */
export interface StorageProvider {
  /** העלאת קובץ */
  uploadFile(params: UploadFileParams): Promise<UploadFileResult>;
  /** מחיקת קובץ */
  deleteFile(fileKey: string): Promise<void>;
  /** קבלת URL לקובץ */
  getFileUrl(fileKey: string): Promise<string>;
  /** רשימת קבצים בתיקייה */
  listFiles(prefix: string): Promise<StorageFile[]>;
}

export interface UploadFileParams {
  /** שם הקובץ */
  filename: string;
  /** תוכן הקובץ */
  buffer: Buffer;
  /** סוג MIME */
  mimeType: string;
  /** תיקייה / נתיב */
  folder?: string;
}

export interface UploadFileResult {
  /** מפתח הקובץ באחסון */
  fileKey: string;
  /** URL לגישה */
  fileUrl: string;
  /** גודל בבייטים */
  fileSize: number;
}

export interface StorageFile {
  fileKey: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  lastModified: Date;
}

// ─── ספק סקירת AI ─────────────────────────────────────────────────────────

/** ממשק ספק בינה מלאכותית – לבדיקת חוזים, הצעת סעיפים, וזיהוי סיכונים */
export interface AIReviewProvider {
  /** סקירת חוזה ומתן הערות */
  reviewContract(content: string): Promise<ContractReviewResult>;
  /** הצעת סעיפים רלוונטיים */
  suggestClauses(context: ClauseSuggestionContext): Promise<ClauseSuggestion[]>;
  /** סיכום חוזה */
  summarizeContract(content: string): Promise<ContractSummary>;
  /** זיהוי סיכונים */
  detectRisks(content: string): Promise<RiskDetectionResult>;
}

export interface ContractReviewResult {
  /** ציון כולל 0-100 */
  overallScore: number;
  /** הערות לסעיפים */
  annotations: ReviewAnnotation[];
  /** המלצות כלליות */
  recommendations: string[];
}

export interface ReviewAnnotation {
  /** מיקום בטקסט */
  startOffset: number;
  endOffset: number;
  /** חומרה */
  severity: "info" | "warning" | "critical";
  /** הודעה */
  message: string;
  /** הצעה לתיקון */
  suggestion?: string;
}

export interface ClauseSuggestionContext {
  contractType: string;
  industry?: string;
  existingClauses?: string[];
}

export interface ClauseSuggestion {
  /** כותרת הסעיף */
  title: string;
  /** תוכן הסעיף */
  content: string;
  /** רמת רלוונטיות 0-1 */
  relevanceScore: number;
  /** סיבת ההמלצה */
  reason: string;
}

export interface ContractSummary {
  /** סיכום קצר */
  summary: string;
  /** נקודות מפתח */
  keyPoints: string[];
  /** צדדים */
  parties: string[];
  /** תאריכים חשובים */
  keyDates: { label: string; date: string }[];
  /** ערך כספי שזוהה */
  financialTerms: string[];
}

export interface RiskDetectionResult {
  /** רמת סיכון כוללת */
  riskLevel: "low" | "medium" | "high" | "critical";
  /** סיכונים שזוהו */
  risks: DetectedRisk[];
}

export interface DetectedRisk {
  /** קטגוריית סיכון */
  category: string;
  /** חומרה */
  severity: "low" | "medium" | "high" | "critical";
  /** תיאור */
  description: string;
  /** סעיף רלוונטי */
  relatedClause?: string;
  /** הצעה לצמצום הסיכון */
  mitigation?: string;
}
