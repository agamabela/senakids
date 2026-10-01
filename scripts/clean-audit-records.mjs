import { PrismaClient } from "@prisma/client";

/**
 * Safe cleanup script for known automated audit test records.
 * Only targets explicitly identified test fixture emails.
 * Real user submissions are never touched.
 */
async function main() {
  const prisma = new PrismaClient({
    log: ["error"],
  });

  const knownAuditEmails = [
    "rahma@example.com",
    "budi@example.com",
  ];

  console.log("Searching for known audit test records...");

  const testRecords = await prisma.contactReport.findMany({
    where: {
      OR: [
        { email: { in: knownAuditEmails } },
        { email: { endsWith: "@senakids.test" } },
        { name: { startsWith: "[TEST_FIXTURE" } },
      ],
    },
    select: {
      id: true,
      email: true,
      category: true,
      createdAt: true,
    },
  });

  if (testRecords.length === 0) {
    console.log("No audit test records found. Database is clean.");
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${testRecords.length} audit test record(s) to remove:`);
  for (const r of testRecords) {
    console.log(` - ID ${r.id}: ${r.email} (${r.category}) created at ${r.createdAt.toISOString()}`);
  }

  const result = await prisma.contactReport.deleteMany({
    where: {
      id: { in: testRecords.map((r) => r.id) },
    },
  });

  console.log(`Successfully deleted ${result.count} audit test record(s).`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error during cleanup:", err);
  process.exit(1);
});
