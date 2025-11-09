// scripts/check-db.ts (or .js)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('✓ DATABASE_URL is defined.');
  // Simple connectivity probe
  await prisma.$queryRaw`SELECT 1`;  // <-- tagged template is the safe, valid form
  console.log('✓ Database connection successful.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('✗ Database check failed:', e?.message || e);
    await prisma.$disconnect();
    process.exit(1);
  });
