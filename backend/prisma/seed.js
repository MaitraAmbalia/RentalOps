require('dotenv').config();
const { prisma } = require('../src/config/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function main() {
  console.log('Starting database seeding...');

  // 1. Clear existing data safely using PostgreSQL CASCADE truncation
  console.log('Truncating database tables...');
  const tables = [
    'Vendor', 'Client', 'ProductCategory', 'Attribute', 'AttributeValue',
    'Product', 'ProductVariant', 'ProductAttribute', 'ProductAttributeValue',
    'PriceList', 'PriceListRule', 'Coupon', 'CouponRedemption',
    'Cart', 'CartItem', 'WishlistItem', 'QuotationTemplate', 'QuotationTemplateLine',
    'Quotation', 'QuotationItem', 'Order', 'OrderItem', 'Payment',
    'Invoice', 'InvoiceLine', 'SecurityDepositInvoice', 'PickupReturnWorkflow',
    'SupportQuery', 'RefreshToken', 'Notification', 'VendorSettings', 'DeliveryPartner'
  ];
  
  const truncateQuery = `TRUNCATE TABLE ${tables.map(t => `"${t}"`).join(', ')} CASCADE;`;
  await prisma.$executeRawUnsafe(truncateQuery);
  console.log('✓ Tables truncated successfully.');

  const passwordHash = await bcrypt.hash('Pass@123_', SALT_ROUNDS);

  // 2. Seed Vendor
  console.log('Seeding Vendor...');
  const vendor = await prisma.vendor.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'vendor@example.com',
      passwordHash,
      companyName: 'Prime Rentals Inc.',
      companyProductCategory: 'Electronics & Media',
      gstNo: '29GGGGG1314R9Z9',
    },
  });

  // 3. Seed Client
  console.log('Seeding Client...');
  const client = await prisma.client.create({
    data: {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'client@example.com',
      phone: '9876543210',
      passwordHash,
    },
  });

  // 4. Seed "Late Fees" Service Product (necessary for VendorSettings)
  console.log('Seeding Late Fees Service Product...');
  const lateFeeProduct = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      name: 'Late Fees',
      type: 'SERVICE',
      rentalPrice: 150.00,
      isPublished: true,
      quantityOnHand: 1,
    },
  });

  // 5. Seed Vendor Settings
  console.log('Seeding Vendor Settings...');
  const settings = await prisma.vendorSettings.create({
    data: {
      vendorId: vendor.id,
      lateFeeEnabled: true,
      defaultLateFeeRatePerHour: 150.00,
      lateFeeGracePeriodMinutes: 30,
      defaultLateFeeProductId: lateFeeProduct.id,
      defaultDepositCalcType: 'PERCENT_OF_RENTAL',
      defaultDepositValue: 50.00, // 50% security deposit
      defaultTaxPercent: 18.00, // 18% GST
    },
  });

  // 6. Seed Categories
  console.log('Seeding Product Categories...');
  const categories = [];
  const categoryNames = ['Cameras', 'Laptops', 'Lighting', 'Audio'];
  
  for (const name of categoryNames) {
    const cat = await prisma.productCategory.create({
      data: {
        name,
        vendorId: vendor.id,
      },
    });
    categories.push(cat);
  }

  // Map category names for quick access
  const catMap = {
    Cameras: categories.find((c) => c.name === 'Cameras').id,
    Laptops: categories.find((c) => c.name === 'Laptops').id,
    Lighting: categories.find((c) => c.name === 'Lighting').id,
    Audio: categories.find((c) => c.name === 'Audio').id,
  };

  // 7. Seed Products
  console.log('Seeding 15 Rental Products...');
  const productsToSeed = [
    // --- Cameras ---
    {
      name: 'Canon EOS R5 Mirrorless Camera',
      categoryId: catMap.Cameras,
      rentalPrice: 1500.00,
      quantityOnHand: 5,
      periodicity: 'DAY',
      isPublished: true,
    },
    {
      name: 'Sony A7 IV Camera Body',
      categoryId: catMap.Cameras,
      rentalPrice: 1200.00,
      quantityOnHand: 8,
      periodicity: 'DAY',
      isPublished: true,
    },
    {
      name: 'Blackmagic Pocket Cinema 6K Pro',
      categoryId: catMap.Cameras,
      rentalPrice: 2200.00,
      quantityOnHand: 3,
      periodicity: 'DAY',
      isPublished: true,
    },
    {
      name: 'Fujifilm X-T4 Camera',
      categoryId: catMap.Cameras,
      rentalPrice: 900.00,
      quantityOnHand: 6,
      periodicity: 'DAY',
      isPublished: true,
    },

    // --- Laptops ---
    {
      name: 'MacBook Pro 16" M2 Max (32GB RAM, 1TB SSD)',
      categoryId: catMap.Laptops,
      rentalPrice: 2500.00,
      quantityOnHand: 4,
      periodicity: 'DAY',
      isPublished: true,
    },
    {
      name: 'Dell XPS 15 (16GB RAM, 512GB SSD)',
      categoryId: catMap.Laptops,
      rentalPrice: 1300.00,
      quantityOnHand: 7,
      periodicity: 'DAY',
      isPublished: true,
    },
    {
      name: 'Lenovo ThinkPad X1 Carbon Gen 10',
      categoryId: catMap.Laptops,
      rentalPrice: 1100.00,
      quantityOnHand: 10,
      periodicity: 'DAY',
      isPublished: true,
    },
    {
      name: 'ASUS ROG Zephyrus G14 Gaming Laptop',
      categoryId: catMap.Laptops,
      rentalPrice: 1700.00,
      quantityOnHand: 5,
      periodicity: 'DAY',
      isPublished: true,
    },

    // --- Lighting ---
    {
      name: 'Aputure Light Storm LS 600d Pro',
      categoryId: catMap.Lighting,
      rentalPrice: 1200.00,
      quantityOnHand: 4,
      periodicity: 'DAY',
      isPublished: true,
    },
    {
      name: 'Godox FV150 High Speed Sync LED',
      categoryId: catMap.Lighting,
      rentalPrice: 400.00,
      quantityOnHand: 12,
      periodicity: 'DAY',
      isPublished: true,
    },
    {
      name: 'Nanlite PavoTube II 30C RGB LED Tube',
      categoryId: catMap.Lighting,
      rentalPrice: 300.00,
      quantityOnHand: 15,
      periodicity: 'DAY',
      isPublished: true,
    },

    // --- Audio ---
    {
      name: 'Sennheiser MKH416 Shotgun Microphone',
      categoryId: catMap.Audio,
      rentalPrice: 650.00,
      quantityOnHand: 6,
      periodicity: 'DAY',
      isPublished: true,
    },
    {
      name: 'Zoom H6 Handy Recorder',
      categoryId: catMap.Audio,
      rentalPrice: 400.00,
      quantityOnHand: 8,
      periodicity: 'DAY',
      isPublished: true,
    },
    {
      name: 'Rode Wireless GO II Dual Channel Mic',
      categoryId: catMap.Audio,
      rentalPrice: 350.00,
      quantityOnHand: 12,
      periodicity: 'DAY',
      isPublished: true,
    },
    {
      name: 'Shure SM7B Cardioid Dynamic Vocal Mic',
      categoryId: catMap.Audio,
      rentalPrice: 300.00,
      quantityOnHand: 10,
      periodicity: 'DAY',
      isPublished: true,
    },
  ];

  for (const productInfo of productsToSeed) {
    await prisma.product.create({
      data: {
        vendorId: vendor.id,
        ...productInfo,
      },
    });
  }

  console.log('✓ Seeding complete! Database is ready.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
