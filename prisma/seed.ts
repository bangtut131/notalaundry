import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Creating Super Admin...');

  const email = process.env.SUPERADMIN_EMAIL || 'superadmin@notalaundry.id';
  const password = process.env.SUPERADMIN_PASSWORD || 'admin123';
  const name = process.env.SUPERADMIN_NAME || 'Super Admin';

  // Check if already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Super Admin already exists: ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      password: hashPassword(password),
      name,
      role: 'SUPERADMIN',
      storeId: null, // not tied to any store
    }
  });

  console.log(`✅ Super Admin created!`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log('   ⚠️  Ganti password ini segera setelah login pertama!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
