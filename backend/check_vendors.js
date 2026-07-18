const { prisma } = require('./src/config/db');

async function main() {
  const vendors = await prisma.vendor.findMany({
    select: { id: true, email: true, firstName: true, isActive: true }
  });
  console.log('Vendors in DB:', JSON.stringify(vendors, null, 2));
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
