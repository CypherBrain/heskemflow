import "dotenv/config";
import { PrismaClient, ContractStatus, UserRole } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
const org = await prisma.organization.upsert({
where: { id: "demo_org" },
update: {},
create: {
id: "demo_org",
name: "HeskemFlow Demo",
registrationNumber: "516123456",
country: "Israel",
defaultLanguage: "he",
},
});

const admin = await prisma.user.upsert({
where: { clerkUserId: "demo_clerk_user" },
update: {},
create: {
clerkUserId: "demo_clerk_user",
organizationId: org.id,
fullName: "מנהל מערכת",
email: "[admin@heskemflow.co.il](mailto:admin@heskemflow.co.il)",
role: UserRole.ADMIN,
},
});

const company = await prisma.company.create({
data: {
organizationId: org.id,
name: "Alpha Tech בע״מ",
registrationNumber: "516987654",
address: "תל אביב, ישראל",
industry: "SaaS / Technology",
},
});

const contact = await prisma.contact.create({
data: {
organizationId: org.id,
companyId: company.id,
fullName: "דניאל כהן",
email: "[daniel@example.co.il](mailto:daniel@example.co.il)",
phone: "050-1234567",
title: "מנכ״ל",
isSignatory: true,
},
});

const deal = await prisma.deal.create({
data: {
organizationId: org.id,
companyId: company.id,
contactId: contact.id,
title: "הטמעת CRM וניהול חוזים",
amount: 38000,
currency: "ILS",
stage: "Won",
sourceCrm: "manual",
},
});

const serviceTemplate = await prisma.contractTemplate.create({
data: {
organizationId: org.id,
name: "הסכם שירותים + SOW",
language: "he",
contractType: "Service Agreement",
content: {
title: "הסכם שירותים",
sections: [
"צדדים להסכם",
"היקף השירותים",
"תמורה ותנאי תשלום",
"סודיות",
"קניין רוחני",
"סיום התקשרות",
],
},
},
});

await prisma.contract.create({
data: {
organizationId: org.id,
companyId: company.id,
contactId: contact.id,
dealId: deal.id,
templateId: serviceTemplate.id,
title: "הסכם שירותים — Alpha Tech",
contractType: "Service Agreement",
industry: "SaaS / Technology",
status: ContractStatus.DRAFT,
amount: 38000,
currency: "ILS",
startDate: new Date(),
renewalDate: new Date("2026-12-31"),
cancellationNoticeDays: 60,
internalOwnerId: admin.id,
},
});

await prisma.clause.createMany({
data: [
{
organizationId: org.id,
title: "סעיף תשלום",
category: "Payment",
language: "he",
riskLevel: "high",
content: "הלקוח ישלם לחברה את התמורה בהתאם לתנאי התשלום המפורטים בהסכם.",
},
{
organizationId: org.id,
title: "סעיף סודיות",
category: "Confidentiality",
language: "he",
riskLevel: "medium",
content: "הצדדים מתחייבים לשמור בסודיות כל מידע מסחרי, עסקי או טכנולוגי.",
},
{
organizationId: org.id,
title: "מגבלת אחריות",
category: "Liability",
language: "he",
riskLevel: "high",
content: "אחריות החברה תוגבל לסכום ששולם בפועל במסגרת ההסכם.",
},
],
});

await prisma.industryPack.createMany({
data: [
{
organizationId: org.id,
name: "חברות שירותים / סוכנויות",
slug: "services-agencies",
description: "תבניות שירותים, ריטיינר, SOW, NDA וקבלני משנה.",
config: {
requiredFields: ["scope", "paymentTerms", "terminationNotice", "liabilityLimit"],
},
},
{
organizationId: org.id,
name: "נדל״ן וניהול נכסים",
slug: "real-estate",
description: "שכירות, ערבויות, חידושים, פיקדונות וניהול נכסים.",
config: {
requiredFields: ["propertyAddress", "tenant", "rent", "deposit", "renewalDate"],
},
},
{
organizationId: org.id,
name: "HR / גיוס והשמה",
slug: "hr-recruitment",
description: "הסכמי השמה, עובדים, קבלנים, עמלות הצלחה ותקופת החלפה.",
config: {
requiredFields: ["candidate", "fee", "replacementPeriod", "paymentTerms"],
},
},
],
});

console.log("Seed completed successfully");
}

main()
.catch((error) => {
console.error(error);
process.exit(1);
})
.finally(async () => {
await prisma.$disconnect();
});
