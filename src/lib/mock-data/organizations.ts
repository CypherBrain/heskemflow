import type { Organization } from '@/lib/types';

export const ORG_ID = 'org_clx8k2m0v0001qr5g7h3j4k5l';

export const mockOrganizations: Organization[] = [
  {
    id: ORG_ID,
    name: 'חסקם טכנולוגיות',
    slug: 'heskem-tech',
    domain: 'heskem.co.il',
    plan: 'enterprise',
    settings: {
      language: 'he',
      currency: 'ILS',
      timezone: 'Asia/Jerusalem',
      direction: 'rtl',
    },
    createdAt: '2024-06-01T10:00:00.000Z',
    updatedAt: '2025-03-15T08:30:00.000Z',
  },
];
