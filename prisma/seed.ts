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
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  const organizationId = "demo_org";

  // Clean existing demo data in proper order (handle circular FK: user <-> department)
  await prisma.notification.deleteMany({ where: { organizationId } });
  await prisma.attachment.deleteMany({ where: { contract: { organizationId } } });
  await prisma.comment.deleteMany({ where: { contract: { organizationId } } });
  await prisma.auditLog.deleteMany({ where: { organizationId } });
  await prisma.renewalReminder.deleteMany({ where: { contract: { organizationId } } });
  await prisma.contractObligation.deleteMany({ where: { contract: { organizationId } } });
  await prisma.signatureRequest.deleteMany({ where: { contract: { organizationId } } });
  await prisma.approvalRequest.deleteMany({ where: { contract: { organizationId } } });
  await prisma.contractVersion.deleteMany({ where: { contract: { organizationId } } });
  await prisma.aiReview.deleteMany({ where: { organizationId } });
  await prisma.contract.deleteMany({ where: { organizationId } });
  await prisma.deal.deleteMany({ where: { organizationId } });
  await prisma.contact.deleteMany({ where: { organizationId } });
  await prisma.company.deleteMany({ where: { organizationId } });
  await prisma.contractTemplate.deleteMany({ where: { organizationId } });
  await prisma.clause.deleteMany({ where: { organizationId } });
  await prisma.industryPack.deleteMany({ where: { organizationId } });
  await prisma.crmIntegration.deleteMany({ where: { organizationId } });
  // Break circular FK: clear department manager refs, then user dept refs
  await prisma.department.updateMany({ where: { organizationId }, data: { managerId: null } });
  await prisma.user.updateMany({ where: { organizationId }, data: { departmentId: null } });
  await prisma.user.deleteMany({ where: { organizationId } });
  await prisma.department.deleteMany({ where: { organizationId } });

  const org = await prisma.organization.upsert({
    where: { id: organizationId },
    update: { name: "HeskemFlow Demo", registrationNumber: "516123456", country: "Israel", defaultLanguage: "he" },
    create: { id: organizationId, name: "HeskemFlow Demo", registrationNumber: "516123456", country: "Israel", defaultLanguage: "he" },
  });

  // Departments
  const deptData = [
    { name: "הנהלה", description: "הנהלה בכירה ודירקטוריון" },
    { name: "משפטי", description: "ייעוץ משפטי, חוזים ורגולציה" },
    { name: "כספים", description: "חשבונאות, תקציב ובקרה" },
    { name: "מכירות", description: "מכירות ופיתוח עסקי" },
    { name: "תפעול", description: "תפעול שוטף וניהול פרויקטים" },
    { name: "משאבי אנוש", description: "גיוס, רווחה ותנאי העסקה" },
    { name: "טכנולוגיה / IT", description: "פיתוח, תשתיות ואבטחת מידע" },
    { name: "רכש", description: "רכש ספקים וקבלני משנה" },
    { name: "שירות לקוחות", description: "תמיכה ושירות לקוחות" },
  ];

  const departments: Record<string, string> = {};
  for (const d of deptData) {
    const dept = await prisma.department.create({
      data: { organizationId: org.id, name: d.name, description: d.description },
    });
    departments[d.name] = dept.id;
  }

  // Users with department assignment (upsert to handle existing clerkUserId)
  const admin = await prisma.user.upsert({
    where: { clerkUserId: "demo_clerk_user" },
    update: {
      organizationId: org.id,
      fullName: "מנהל מערכת",
      email: "admin@heskemflow.co.il",
      role: UserRole.ADMIN,
      departmentId: departments["הנהלה"],
      phone: "050-1111111",
      title: "מנכ״ל",
      isActive: true,
    },
    create: {
      clerkUserId: "demo_clerk_user",
      organizationId: org.id,
      fullName: "מנהל מערכת",
      email: "admin@heskemflow.co.il",
      role: UserRole.ADMIN,
      departmentId: departments["הנהלה"],
      phone: "050-1111111",
      title: "מנכ״ל",
    },
  });

  const legalUser = await prisma.user.upsert({
    where: { clerkUserId: "demo_legal_user" },
    update: {
      organizationId: org.id,
      fullName: "יועץ משפטי",
      email: "legal@heskemflow.co.il",
      role: UserRole.LEGAL,
      departmentId: departments["משפטי"],
      phone: "050-2222222",
      title: "יועץ משפטי ראשי",
      isActive: true,
    },
    create: {
      clerkUserId: "demo_legal_user",
      organizationId: org.id,
      fullName: "יועץ משפטי",
      email: "legal@heskemflow.co.il",
      role: UserRole.LEGAL,
      departmentId: departments["משפטי"],
      phone: "050-2222222",
      title: "יועץ משפטי ראשי",
    },
  });

  // Set department managers
  await prisma.department.update({
    where: { id: departments["הנהלה"] },
    data: { managerId: admin.id },
  });
  await prisma.department.update({
    where: { id: departments["משפטי"] },
    data: { managerId: legalUser.id },
  });

  // Companies
  const company = await prisma.company.create({
    data: {
      organizationId: org.id,
      name: "Alpha Tech בע״מ",
      registrationNumber: "516987654",
      address: "תל אביב, ישראל",
      industry: "SaaS / Technology",
    },
  });

  const secondCompany = await prisma.company.create({
    data: {
      organizationId: org.id,
      name: "Urban Properties בע״מ",
      registrationNumber: "515555111",
      address: "רמת גן, ישראל",
      industry: "Real Estate / Property Management",
    },
  });

  // Contacts
  const contact = await prisma.contact.create({
    data: {
      organizationId: org.id,
      companyId: company.id,
      fullName: "דניאל כהן",
      email: "daniel@example.co.il",
      phone: "050-1234567",
      title: "מנכ״ל",
      isSignatory: true,
    },
  });

  const secondContact = await prisma.contact.create({
    data: {
      organizationId: org.id,
      companyId: secondCompany.id,
      fullName: "נועה לוי",
      email: "noa@example.co.il",
      phone: "052-5557788",
      title: "מנהלת תפעול",
      isSignatory: true,
    },
  });

  // Deals
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

  const secondDeal = await prisma.deal.create({
    data: {
      organizationId: org.id,
      companyId: secondCompany.id,
      contactId: secondContact.id,
      title: "הסכם ניהול נכסים שנתי",
      amount: 72000,
      currency: "ILS",
      stage: "Proposal",
      sourceCrm: "manual",
    },
  });

  // Industry Packs
  const servicesPack = await prisma.industryPack.create({
    data: {
      organizationId: org.id,
      name: "חברות שירותים / סוכנויות",
      slug: "services-agencies",
      description: "תבניות שירותים, ריטיינר, SOW, NDA וקבלני משנה.",
      config: {
        requiredFields: ["scope", "paymentTerms", "terminationNotice", "liabilityLimit"],
        alerts: ["חסר סעיף סיום התקשרות", "חסר גבול אחריות"],
      },
    },
  });

  const realEstatePack = await prisma.industryPack.create({
    data: {
      organizationId: org.id,
      name: "נדל״ן וניהול נכסים",
      slug: "real-estate",
      description: "שכירות, ערבויות, חידושים, פיקדונות וניהול נכסים.",
      config: {
        requiredFields: ["propertyAddress", "tenant", "rent", "deposit", "renewalDate"],
        alerts: ["חסר מועד הודעה מוקדמת", "חסר סעיף פיקדון"],
      },
    },
  });

  await prisma.industryPack.createMany({
    data: [
      { organizationId: org.id, name: "HR / גיוס והשמה", slug: "hr-recruitment", description: "הסכמי השמה, עובדים, קבלנים, עמלות הצלחה ותקופת החלפה.", config: { requiredFields: ["candidate", "fee", "replacementPeriod", "paymentTerms"] } },
      { organizationId: org.id, name: "SaaS / טכנולוגיה", slug: "saas-technology", description: "SaaS, רישוי תוכנה, הטמעה, SLA, פרטיות ותמיכה.", config: { requiredFields: ["licenseScope", "sla", "support", "dataProtection"] } },
      { organizationId: org.id, name: "קבלנים / בנייה", slug: "construction-contractors", description: "עבודות קבלנות, אבני דרך, אחריות, לוחות זמנים ותשלומים.", config: { requiredFields: ["scope", "milestones", "warranty", "paymentSchedule"] } },
      { organizationId: org.id, name: "קליניקות / Med Spa", slug: "clinics-medspa", description: "הסכמי שירותים, אחריות, תיאום תורים, ביטולים ותשלומים.", config: { requiredFields: ["serviceTerms", "cancellationPolicy", "paymentTerms"] } },
    ],
  });

  // Templates
  const serviceTemplate = await prisma.contractTemplate.create({
    data: {
      organizationId: org.id,
      industryPackId: servicesPack.id,
      name: "הסכם שירותים + SOW",
      language: "he",
      contractType: "Service Agreement",
      content: { title: "הסכם שירותים", sections: ["צדדים להסכם", "היקף השירותים", "תמורה ותנאי תשלום", "סודיות", "קניין רוחני", "סיום התקשרות"] },
      isActive: true,
    },
  });

  const realEstateTemplate = await prisma.contractTemplate.create({
    data: {
      organizationId: org.id,
      industryPackId: realEstatePack.id,
      name: "הסכם ניהול נכסים",
      language: "he",
      contractType: "Property Management Agreement",
      content: { title: "הסכם ניהול נכסים", sections: ["פרטי הנכס", "שירותי ניהול", "דמי ניהול", "חובות הצדדים", "חידוש וסיום"] },
      isActive: true,
    },
  });

  // Clauses
  await prisma.clause.createMany({
    data: [
      { organizationId: org.id, title: "סעיף תשלום", category: "Payment", language: "he", riskLevel: "high", content: "הלקוח ישלם לחברה את התמורה בהתאם לתנאי התשלום המפורטים בהסכם." },
      { organizationId: org.id, title: "סעיף סודיות", category: "Confidentiality", language: "he", riskLevel: "medium", content: "הצדדים מתחייבים לשמור בסודיות כל מידע מסחרי, עסקי או טכנולוגי." },
      { organizationId: org.id, title: "מגבלת אחריות", category: "Liability", language: "he", riskLevel: "high", content: "אחריות החברה תוגבל לסכום ששולם בפועל במסגרת ההסכם." },
      { organizationId: org.id, title: "סיום התקשרות", category: "Termination", language: "he", riskLevel: "medium", content: "כל צד רשאי לסיים את ההתקשרות בהודעה מוקדמת בכתב בהתאם למספר הימים שנקבע בהסכם." },
      { organizationId: org.id, title: "קניין רוחני", category: "Intellectual Property", language: "he", riskLevel: "medium", content: "כל זכויות הקניין הרוחני בתוצרים יוסדרו בהתאם להוראות ההסכם ולתשלום התמורה בפועל." },
    ],
  });

  // Contracts
  const contract = await prisma.contract.create({
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

  await prisma.contractVersion.create({
    data: {
      contractId: contract.id,
      versionNumber: 1,
      createdById: admin.id,
      changeSummary: "גרסה ראשונית מתוך seed demo",
      content: { title: "הסכם שירותים — Alpha Tech", template: serviceTemplate.name, clauses: ["סעיף תשלום", "סעיף סודיות", "מגבלת אחריות"] },
    },
  });

  await prisma.renewalReminder.create({
    data: { contractId: contract.id, reminderDate: new Date("2026-11-01"), reminderType: "renewal", status: "SCHEDULED" },
  });

  const secondContract = await prisma.contract.create({
    data: {
      organizationId: org.id,
      companyId: secondCompany.id,
      contactId: secondContact.id,
      dealId: secondDeal.id,
      templateId: realEstateTemplate.id,
      title: "הסכם ניהול נכסים — Urban Properties",
      contractType: "Property Management Agreement",
      industry: "Real Estate / Property Management",
      status: ContractStatus.INTERNAL_REVIEW,
      amount: 72000,
      currency: "ILS",
      startDate: new Date(),
      renewalDate: new Date("2027-01-15"),
      cancellationNoticeDays: 90,
      internalOwnerId: legalUser.id,
    },
  });

  await prisma.contractVersion.create({
    data: {
      contractId: secondContract.id,
      versionNumber: 1,
      createdById: legalUser.id,
      changeSummary: "גרסה ראשונית להסכם ניהול נכסים",
      content: { title: "הסכם ניהול נכסים — Urban Properties", template: realEstateTemplate.name },
    },
  });

  // Sample Obligations
  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const pastDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  await prisma.contractObligation.createMany({
    data: [
      {
        contractId: contract.id,
        title: "בדיקת SLA חודשית",
        description: "לוודא עמידה במדדי השירות לפני סוף כל חודש.",
        obligationType: "sla",
        dueDate: in7Days,
        ownerId: admin.id,
        departmentId: departments["תפעול"],
        priority: "HIGH",
        triggerType: "DUE_DATE",
        notifyBeforeDays: 3,
        source: "manual",
        status: "OPEN",
      },
      {
        contractId: contract.id,
        title: "תשלום חודשי — ינואר",
        description: "העברת תשלום חודשי לפי הסכם.",
        obligationType: "payment",
        dueDate: pastDate,
        ownerId: admin.id,
        departmentId: departments["כספים"],
        priority: "CRITICAL",
        triggerType: "PAYMENT_DATE",
        notifyBeforeDays: 7,
        source: "manual",
        status: "OPEN",
      },
      {
        contractId: contract.id,
        title: "בדיקה משפטית שנתית",
        description: "ביצוע סקירה משפטית שנתית של ההסכם.",
        obligationType: "legal_review",
        dueDate: in3Days,
        ownerId: legalUser.id,
        departmentId: departments["משפטי"],
        priority: "MEDIUM",
        triggerType: "DUE_DATE",
        notifyBeforeDays: 14,
        source: "manual",
        status: "IN_PROGRESS",
      },
      {
        contractId: secondContract.id,
        title: "חתימה על הסכם ניהול",
        description: "השלמת חתימות על ההסכם.",
        obligationType: "signature",
        dueDate: in7Days,
        ownerId: legalUser.id,
        departmentId: departments["משפטי"],
        priority: "HIGH",
        triggerType: "SIGNATURE_PENDING",
        notifyBeforeDays: 3,
        source: "manual",
        status: "OPEN",
      },
      {
        contractId: secondContract.id,
        title: "בדיקת כספים — תנאי תשלום",
        description: "אימות תנאי התשלום מול מח׳ כספים.",
        obligationType: "financial_review",
        dueDate: in3Days,
        ownerId: admin.id,
        departmentId: departments["כספים"],
        priority: "MEDIUM",
        triggerType: "DUE_DATE",
        notifyBeforeDays: 7,
        source: "manual",
        status: "OPEN",
      },
    ],
  });

  // Sample Notifications
  await prisma.notification.createMany({
    data: [
      {
        organizationId: org.id,
        contractId: contract.id,
        type: "CONTRACT_RENEWAL",
        title: "חידוש חוזה מתקרב",
        message: `החוזה "הסכם שירותים — Alpha Tech" עומד להתחדש בעוד מספר חודשים.`,
        severity: "WARNING",
        actionUrl: `/contracts/${contract.id}`,
        dueDate: new Date("2026-12-31"),
      },
      {
        organizationId: org.id,
        contractId: secondContract.id,
        type: "APPROVAL_REQUIRED",
        title: "נדרש אישור",
        message: `החוזה "הסכם ניהול נכסים — Urban Properties" ממתין לבדיקה פנימית.`,
        severity: "WARNING",
        actionUrl: `/contracts/${secondContract.id}`,
      },
      {
        organizationId: org.id,
        contractId: contract.id,
        type: "OBLIGATION_DUE",
        title: "התחייבות באיחור",
        message: `"תשלום חודשי — ינואר" (הסכם שירותים — Alpha Tech) באיחור.`,
        severity: "CRITICAL",
        actionUrl: `/contracts/${contract.id}`,
        dueDate: pastDate,
      },
      {
        organizationId: org.id,
        contractId: secondContract.id,
        type: "SIGNATURE_PENDING",
        title: "ממתין לחתימה",
        message: `חתימה על הסכם ניהול נכסים — Urban Properties טרם הושלמה.`,
        severity: "INFO",
        actionUrl: `/contracts/${secondContract.id}`,
      },
    ],
  });

  // Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { organizationId: org.id, contractId: contract.id, actorId: admin.id, action: "CONTRACT_CREATED", metadata: { source: "seed", title: contract.title } },
      { organizationId: org.id, contractId: contract.id, actorId: admin.id, action: "CONTRACT_VERSION_CREATED", metadata: { versionNumber: 1 } },
      { organizationId: org.id, contractId: secondContract.id, actorId: legalUser.id, action: "CONTRACT_CREATED", metadata: { source: "seed", title: secondContract.title } },
    ],
  });

  await prisma.comment.create({
    data: { contractId: contract.id, authorId: admin.id, authorName: "מנהל מערכת", visibility: "INTERNAL", body: "חוזה דמו ראשוני לצורך בדיקת המערכת." },
  });

  await prisma.crmIntegration.createMany({
    data: [
      { organizationId: org.id, provider: "Zoho CRM", status: "connected", config: { mode: "demo", sync: "manual" } },
      { organizationId: org.id, provider: "HubSpot", status: "disconnected", config: { mode: "demo" } },
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
