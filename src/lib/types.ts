// ─── Enums & Literal Unions ────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'invited';

export type DealStage =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export type ContractStatus =
  | 'draft'
  | 'pending_review'
  | 'pending_approval'
  | 'approved'
  | 'active'
  | 'expired'
  | 'terminated'
  | 'renewed';

export type ContractType =
  | 'service_agreement'
  | 'nda'
  | 'employment'
  | 'sales'
  | 'license'
  | 'partnership'
  | 'consulting'
  | 'lease'
  | 'other';

export type ObligationStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'cancelled';

export type ObligationPriority = 'low' | 'medium' | 'high' | 'critical';

export type ReminderStatus = 'scheduled' | 'sent' | 'acknowledged' | 'dismissed';
export type ReminderType = 'renewal' | 'expiration' | 'obligation' | 'review';

export type ClauseCategory =
  | 'general'
  | 'confidentiality'
  | 'liability'
  | 'payment'
  | 'termination'
  | 'ip'
  | 'indemnification'
  | 'dispute_resolution'
  | 'force_majeure';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'sign'
  | 'send'
  | 'comment'
  | 'upload'
  | 'export'
  | 'archive';

// ─── Core Entities ─────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  domain?: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: {
    language: string;
    currency: string;
    timezone: string;
    direction: 'rtl' | 'ltr';
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  organizationId: string;
  name: string;
  registrationNumber?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    zipCode?: string;
    country: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  organizationId: string;
  companyId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  organizationId: string;
  companyId: string;
  contactId?: string;
  title: string;
  description?: string;
  stage: DealStage;
  value: number;
  currency: string;
  probability: number;
  expectedCloseDate?: string;
  assignedToId: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractVersion {
  id: string;
  contractId: string;
  versionNumber: number;
  title: string;
  changes: string;
  createdById: string;
  fileUrl?: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  organizationId: string;
  companyId: string;
  dealId?: string;
  contactId?: string;
  title: string;
  description?: string;
  type: ContractType;
  status: ContractStatus;
  value: number;
  currency: string;
  startDate: string;
  endDate?: string;
  signedDate?: string;
  templateId?: string;
  assignedToId: string;
  tags?: string[];
  versions: ContractVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: ContractType;
  content: string;
  variables: TemplateVariable[];
  industryPackId?: string;
  isDefault: boolean;
  usageCount: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

export interface Clause {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  category: ClauseCategory;
  tags?: string[];
  isFavorite: boolean;
  usageCount: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Obligation {
  id: string;
  organizationId: string;
  contractId: string;
  title: string;
  description?: string;
  status: ObligationStatus;
  priority: ObligationPriority;
  dueDate: string;
  assignedToId: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  organizationId: string;
  contractId: string;
  type: ReminderType;
  title: string;
  message?: string;
  status: ReminderStatus;
  scheduledDate: string;
  sentAt?: string;
  recipientIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IndustryPack {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  templateCount: number;
  clauseCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: AuditAction;
  actionLabel: string;
  entityType: 'contract' | 'deal' | 'company' | 'contact' | 'template' | 'clause' | 'user';
  entityId: string;
  entityName: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
