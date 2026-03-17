// This script runs during build to push schema and seed superadmin
// If DB is unreachable, it will WARN but NOT fail the build
const { execSync } = require('child_process');

console.log('🚀 [setup] Starting database setup...');

// Step 1: Push schema
let dbReady = false;
try {
  console.log('📦 [setup] Running prisma db push...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', timeout: 15000 });
  console.log('✅ [setup] Database schema pushed successfully!');
  dbReady = true;
} catch (e) {
  console.warn('⚠️ [setup] prisma db push failed - database may be unreachable. App will build anyway.');
  console.warn('⚠️ [setup] You can run "npx prisma db push" manually once your database is ready.');
}

// Step 2: Seed superadmin if DB is ready
if (dbReady) {
  try {
    console.log('👤 [setup] Checking/creating Super Admin...');
    
    const { PrismaClient } = require('@prisma/client');
    const { createHash, randomBytes } = require('crypto');
    
    const prisma = new PrismaClient();
    
    const email = process.env.SUPERADMIN_EMAIL || 'superadmin@notalaundry.id';
    const password = process.env.SUPERADMIN_PASSWORD || 'admin123';
    const name = process.env.SUPERADMIN_NAME || 'Super Admin';
    
    prisma.user.findUnique({ where: { email } })
      .then(existing => {
        if (existing) {
          console.log(`✅ [setup] Super Admin already exists: ${email}`);
          return prisma.$disconnect();
        }
        
        const salt = randomBytes(16).toString('hex');
        const hash = createHash('sha256').update(password + salt).digest('hex');
        
        return prisma.user.create({
          data: { email, password: `${salt}:${hash}`, name, role: 'SUPERADMIN', storeId: null }
        }).then(() => {
          console.log(`✅ [setup] Super Admin created: ${email}`);
          return prisma.$disconnect();
        });
      })
      .catch(e => {
        console.warn('⚠️ [setup] Seed skipped:', e.message);
        return prisma.$disconnect();
      });
  } catch (e) {
    console.warn('⚠️ [setup] Seed error:', e.message);
  }
}

console.log('🎉 [setup] Setup script finished.');
