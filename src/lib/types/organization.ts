// ─── תפקידי משתמש ──────────────────────────────────────────────────────────

/** תפקיד משתמש בארגון */
export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}

// ─── ממשקים ────────────────────────────────────────────────────────────────

/** ארגון */
export interface Organization {
  id: string;
  /** שם הארגון */
  name: string;
  /** מזהה ייחודי קצר */
  slug: string;
  /** לוגו */
  logo: string | null;
  /** תוכנית – free / pro / enterprise */
  plan: string;
  createdAt: Date;
  updatedAt: Date;

  users?: User[];
}

/** משתמש */
export interface User {
  id: string;
  /** מזהה Clerk */
  clerkId: string;
  /** אימייל */
  email: string;
  /** שם פרטי */
  firstName: string | null;
  /** שם משפחה */
  lastName: string | null;
  /** תפקיד */
  role: UserRole;
  organizationId: string;
  organization?: Organization;
  /** אווטאר */
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** לוג פעולות */
export interface AuditLog {
  id: string;
  /** סוג הפעולה – למשל contract.created, approval.approved */
  action: string;
  /** סוג הישות */
  entityType: string;
  /** מזהה הישות */
  entityId: string;
  userId: string;
  user?: User;
  organizationId: string;
  organization?: Organization;
  /** מידע נוסף */
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}
