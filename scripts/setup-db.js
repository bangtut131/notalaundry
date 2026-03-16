// This script runs during build to push schema and seed superadmin
const { execSync } = require('child_process');

console.log('🚀 [setup] Starting database setup...');

// Step 1: Push schema
try {
  console.log('📦 [setup] Running prisma db push...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ [setup] Database schema pushed successfully!');
} catch (e) {
  console.error('❌ [setup] prisma db push failed:', e.message);
  process.exit(1);
}

// Step 2: Seed superadmin if not exists
try {
  console.log('👤 [setup] Checking/creating Super Admin...');
  
  const { PrismaClient } = require('@prisma/client');
  const { createHash, randomBytes } = require('crypto');
  
  const prisma = new PrismaClient();
  
  async function seed() {
    const email = process.env.SUPERADMIN_EMAIL || 'superadmin@notalaundry.id';
    const password = process.env.SUPERADMIN_PASSWORD || 'admin123';
    const name = process.env.SUPERADMIN_NAME || 'Super Admin';
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`✅ [setup] Super Admin already exists: ${email}`);
      return;
    }
    
    const salt = randomBytes(16).toString('hex');
    const hash = createHash('sha256').update(password + salt).digest('hex');
    
    await prisma.user.create({
      data: {
        email,
        password: `${salt}:${hash}`,
        name,
        role: 'SUPERADMIN',
        storeId: null,
      }
    });
    
    console.log(`✅ [setup] Super Admin created: ${email}`);
  }
  
  seed()
    .then(() => prisma.$disconnect())
    .then(() => {
      console.log('🎉 [setup] Database setup complete!');
    })
    .catch(async (e) => {
      console.error('❌ [setup] Seed error:', e.message);
      await prisma.$disconnect();
      // Don't exit with error - app can still work without seed
    });
} catch (e) {
  console.error('⚠️ [setup] Seed skipped:', e.message);
}
