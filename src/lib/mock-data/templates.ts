import type { Template } from '@/lib/types';
import { ORG_ID } from './organizations';
import { USER_IDS } from './users';

export const TEMPLATE_IDS = {
  serviceAgreement: 'tpl_clx8k9a0v0062qr5g1a2b3c4d',
  nda: 'tpl_clx8k9b0v0063qr5g5e6f7g8h',
  employment: 'tpl_clx8k9c0v0064qr5g9i0j1k2l',
  salesAgreement: 'tpl_clx8k9d0v0065qr5g3m4n5o6p',
  consultingAgreement: 'tpl_clx8k9e0v0066qr5g7q8r9s0t',
  licenseAgreement: 'tpl_clx8k9f0v0067qr5g1u2v3w4x',
} as const;

export const mockTemplates: Template[] = [
  {
    id: TEMPLATE_IDS.serviceAgreement,
    organizationId: ORG_ID,
    name: 'הסכם שירותים כללי',
    description: 'תבנית סטנדרטית להסכמי שירותים בין חברות. כוללת סעיפי תשלום, אחריות, סודיות וסיום.',
    type: 'service_agreement',
    content: `הסכם שירותים

שנערך ונחתם ביום {{date}} בין:

{{provider_name}} ח.פ. {{provider_id}} מרחוב {{provider_address}} (להלן: "נותן השירותים")

לבין:

{{client_name}} ח.פ. {{client_id}} מרחוב {{client_address}} (להלן: "מקבל השירותים")

1. הגדרות
2. תיאור השירותים
3. תקופת ההסכם
4. תמורה ותנאי תשלום
5. סודיות
6. קניין רוחני
7. אחריות ושיפוי
8. סיום ההסכם
9. שונות`,
    variables: [
      { key: 'date', label: 'תאריך ההסכם', type: 'date', required: true },
      { key: 'provider_name', label: 'שם נותן השירותים', type: 'text', required: true },
      { key: 'provider_id', label: 'מספר ח.פ. נותן השירותים', type: 'text', required: true },
      { key: 'provider_address', label: 'כתובת נותן השירותים', type: 'text', required: true },
      { key: 'client_name', label: 'שם מקבל השירותים', type: 'text', required: true },
      { key: 'client_id', label: 'מספר ח.פ. מקבל השירותים', type: 'text', required: true },
      { key: 'client_address', label: 'כתובת מקבל השירותים', type: 'text', required: true },
      { key: 'service_fee', label: 'סכום התמורה', type: 'number', required: true },
      { key: 'payment_terms', label: 'תנאי תשלום', type: 'select', required: true, options: ['שוטף + 30', 'שוטף + 60', 'שוטף + 90', 'מיידי'] },
    ],
    isDefault: true,
    usageCount: 24,
    createdById: USER_IDS.shai,
    createdAt: '2024-06-15T10:00:00.000Z',
    updatedAt: '2025-05-01T08:00:00.000Z',
  },
  {
    id: TEMPLATE_IDS.nda,
    organizationId: ORG_ID,
    name: 'הסכם סודיות (NDA)',
    description: 'תבנית להסכם סודיות הדדי או חד צדדי. מותאמת לדרישות הדין הישראלי.',
    type: 'nda',
    content: `הסכם סודיות

שנערך ונחתם ביום {{date}}

הואיל והצדדים מעוניינים לבחון שיתוף פעולה עסקי ביניהם;
והואיל ובמסגרת בחינה זו עשויים הצדדים להחליף מידע סודי;

לפיכך הוסכם, הוצהר והותנה בין הצדדים כדלקמן:

1. הגדרת מידע סודי
2. התחייבויות הצדדים
3. חריגים
4. תקופת הסודיות
5. סעדים
6. שונות`,
    variables: [
      { key: 'date', label: 'תאריך ההסכם', type: 'date', required: true },
      { key: 'party_a_name', label: 'שם צד א׳', type: 'text', required: true },
      { key: 'party_b_name', label: 'שם צד ב׳', type: 'text', required: true },
      { key: 'nda_type', label: 'סוג ההסכם', type: 'select', required: true, options: ['הדדי', 'חד צדדי'] },
      { key: 'confidentiality_period', label: 'תקופת סודיות (שנים)', type: 'number', required: true, defaultValue: '3' },
    ],
    isDefault: true,
    usageCount: 18,
    createdById: USER_IDS.shai,
    createdAt: '2024-06-20T11:00:00.000Z',
    updatedAt: '2025-04-10T09:00:00.000Z',
  },
  {
    id: TEMPLATE_IDS.employment,
    organizationId: ORG_ID,
    name: 'חוזה העסקה',
    description: 'תבנית חוזה העסקה לעובד חדש. כוללת תנאי שכר, הטבות, סודיות ואי-תחרות.',
    type: 'employment',
    content: `חוזה העסקה אישי

שנערך ונחתם ביום {{date}} בין:

{{employer_name}} (להלן: "המעסיק")
לבין:
{{employee_name}} ת.ז. {{employee_id}} (להלן: "העובד")

1. תיאור התפקיד
2. תקופת ההעסקה
3. שכר והטבות
4. שעות עבודה
5. חופשות ומחלה
6. סודיות
7. אי-תחרות
8. קניין רוחני
9. סיום העסקה
10. שונות`,
    variables: [
      { key: 'date', label: 'תאריך תחילת העסקה', type: 'date', required: true },
      { key: 'employer_name', label: 'שם המעסיק', type: 'text', required: true },
      { key: 'employee_name', label: 'שם העובד', type: 'text', required: true },
      { key: 'employee_id', label: 'תעודת זהות', type: 'text', required: true },
      { key: 'position', label: 'תפקיד', type: 'text', required: true },
      { key: 'salary', label: 'שכר חודשי ברוטו', type: 'number', required: true },
    ],
    isDefault: true,
    usageCount: 12,
    createdById: USER_IDS.merav,
    createdAt: '2024-07-01T09:00:00.000Z',
    updatedAt: '2025-03-15T14:00:00.000Z',
  },
  {
    id: TEMPLATE_IDS.salesAgreement,
    organizationId: ORG_ID,
    name: 'הסכם מכירות',
    description: 'תבנית להסכמי מכירת מוצרים או שירותים. כוללת תנאי אספקה, אחריות ותשלום.',
    type: 'sales',
    content: `הסכם מכירות

שנערך ונחתם ביום {{date}}

בין המוכר לבין הקונה כמפורט להלן:

1. הגדרות
2. המוצרים/השירותים
3. מחיר ותשלום
4. אספקה
5. אחריות
6. הגבלת אחריות
7. ביטול ההסכם
8. שונות`,
    variables: [
      { key: 'date', label: 'תאריך ההסכם', type: 'date', required: true },
      { key: 'seller_name', label: 'שם המוכר', type: 'text', required: true },
      { key: 'buyer_name', label: 'שם הקונה', type: 'text', required: true },
      { key: 'total_amount', label: 'סכום העסקה', type: 'number', required: true },
      { key: 'delivery_date', label: 'תאריך אספקה', type: 'date', required: true },
    ],
    isDefault: false,
    usageCount: 8,
    createdById: USER_IDS.merav,
    createdAt: '2024-08-10T10:00:00.000Z',
    updatedAt: '2025-02-20T11:00:00.000Z',
  },
  {
    id: TEMPLATE_IDS.consultingAgreement,
    organizationId: ORG_ID,
    name: 'הסכם ייעוץ',
    description: 'תבנית להסכמי ייעוץ עם יועצים חיצוניים. כוללת היקף עבודה, תעריפים ובעלות על תוצרים.',
    type: 'consulting',
    content: `הסכם ייעוץ

שנערך ונחתם ביום {{date}}

בין הלקוח לבין היועץ כמפורט להלן:

1. היקף השירותים
2. תקופת ההסכם
3. תמורה ותנאי תשלום
4. בעלות על תוצרים
5. סודיות
6. העדר יחסי עובד-מעביד
7. ביטוח
8. סיום ההסכם
9. שונות`,
    variables: [
      { key: 'date', label: 'תאריך ההסכם', type: 'date', required: true },
      { key: 'client_name', label: 'שם הלקוח', type: 'text', required: true },
      { key: 'consultant_name', label: 'שם היועץ', type: 'text', required: true },
      { key: 'hourly_rate', label: 'תעריף שעתי', type: 'number', required: true },
      { key: 'max_hours', label: 'מכסת שעות חודשית', type: 'number', required: false },
    ],
    isDefault: false,
    usageCount: 6,
    createdById: USER_IDS.ori,
    createdAt: '2024-09-15T13:00:00.000Z',
    updatedAt: '2025-05-10T10:00:00.000Z',
  },
  {
    id: TEMPLATE_IDS.licenseAgreement,
    organizationId: ORG_ID,
    name: 'הסכם רישיון תוכנה',
    description: 'תבנית להסכמי רישיון שימוש בתוכנה. כוללת תנאי שימוש, הגבלות ותמיכה.',
    type: 'license',
    content: `הסכם רישיון תוכנה

שנערך ונחתם ביום {{date}}

בין בעל הרישיון לבין בעל הזיכיון כמפורט להלן:

1. הגדרות
2. הענקת הרישיון
3. הגבלות שימוש
4. תמורה
5. תמיכה ותחזוקה
6. קניין רוחני
7. אחריות מוגבלת
8. הגבלת אחריות
9. סיום הרישיון
10. שונות`,
    variables: [
      { key: 'date', label: 'תאריך ההסכם', type: 'date', required: true },
      { key: 'licensor_name', label: 'שם בעל הרישיון', type: 'text', required: true },
      { key: 'licensee_name', label: 'שם הזכיין', type: 'text', required: true },
      { key: 'software_name', label: 'שם התוכנה', type: 'text', required: true },
      { key: 'num_users', label: 'מספר משתמשים', type: 'number', required: true },
      { key: 'license_fee', label: 'דמי רישיון שנתיים', type: 'number', required: true },
    ],
    isDefault: false,
    usageCount: 5,
    createdById: USER_IDS.ori,
    createdAt: '2024-10-01T08:00:00.000Z',
    updatedAt: '2025-04-20T12:00:00.000Z',
  },
];
