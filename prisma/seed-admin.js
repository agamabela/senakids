const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin user...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@senakids.com' }
  });

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists. Updating password...');
    
    const hashedPassword = await bcrypt.hash('SenaKids2024!Secure', 10);
    
    await prisma.user.update({
      where: { email: 'admin@senakids.com' },
      data: {
        password: hashedPassword,
        role: 'admin'
      }
    });
    
    console.log('✅ Admin password updated');
  } else {
    const hashedPassword = await bcrypt.hash('SenaKids2024!Secure', 10);

    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@senakids.com',
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date()
      }
    });

    console.log('✅ Admin user created successfully');
  }

  console.log('\n📧 Admin Credentials:');
  console.log('   Email: admin@senakids.com');
  console.log('   Password: SenaKids2024!Secure');
  console.log('   ⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
