import { db } from '../src/prisma/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed with Prisma 8...');

  // 1. Clean existing records in reverse dependency order
  await db.orm.public.Payment.deleteAll();
  await db.orm.public.OrderItem.deleteAll();
  await db.orm.public.Order.deleteAll();
  await db.orm.public.CartItem.deleteAll();
  await db.orm.public.Session.deleteAll();
  await db.orm.public.Address.deleteAll();
  await db.orm.public.TechnicianServiceArea.deleteAll();
  await db.orm.public.Technician.deleteAll();
  await db.orm.public.Product.deleteAll();
  await db.orm.public.Category.deleteAll();
  await db.orm.public.User.deleteAll();

  // 2. Categories
  const lighting = await db.orm.public.Category.create({
    slug: 'lighting',
    name: 'Lighting',
    sortOrder: 1
  });
  const security = await db.orm.public.Category.create({
    slug: 'security',
    name: 'Security',
    sortOrder: 2
  });
  const audio = await db.orm.public.Category.create({
    slug: 'audio',
    name: 'Audio',
    sortOrder: 3
  });

  // 3. Products
  const products = [
    // Security & Hubs
    {
      slug: 'zigbee-gateway-hub-gen3',
      name: 'Zigbee Multi-Protocol Gateway Hub Gen 3',
      description: 'Enables local automation, ultra-fast response times, and connects all Zigbee 3.0 / Bluetooth mesh sensors to your home network.',
      priceIdr: 450000,
      imageUrl: '/images/product-hub.png',
      kind: 'ADDON' as const,
      status: 'ACTIVE' as const,
      isFeatured: true,
      featuredRank: 1,
      categoryId: security.id
    },
    {
      slug: 'smart-door-lock-pro',
      name: 'Smart Lock Pro Series',
      description: 'Biometric fingerprint, capacitive touch keypad, and encrypted smartphone control with emergency mechanical backup.',
      priceIdr: 800000,
      imageUrl: '/images/product-lock.png',
      kind: 'DEVICE' as const,
      status: 'ACTIVE' as const,
      isFeatured: true,
      featuredRank: 2,
      categoryId: security.id
    },
    {
      slug: 'outdoor-security-camera-2k',
      name: 'Outdoor 2K Smart Security Cam',
      description: 'Weatherproof IP66 camera with night vision, 2-way audio, spotlight illumination, and AI person detection.',
      priceIdr: 650000,
      imageUrl: '/images/product-lock.png',
      kind: 'DEVICE' as const,
      status: 'ACTIVE' as const,
      isFeatured: true,
      featuredRank: 3,
      categoryId: security.id
    },
    {
      slug: 'smart-video-doorbell-hdr',
      name: 'Smart Video Doorbell 2K HDR',
      description: 'Battery or wired video doorbell with head-to-toe 160° view, motion detection, and included indoor chime.',
      priceIdr: 720000,
      imageUrl: '/images/product-hub.png',
      kind: 'DEVICE' as const,
      status: 'ACTIVE' as const,
      isFeatured: true,
      featuredRank: 4,
      categoryId: security.id
    },
    {
      slug: 'pir-smart-motion-sensor',
      name: 'PIR Smart Motion Sensor',
      description: 'Ultra-compact motion detector with built-in ambient light sensor and magnetic mount with 5-year battery life.',
      priceIdr: 135000,
      imageUrl: '/images/product-lock.png',
      kind: 'DEVICE' as const,
      status: 'ACTIVE' as const,
      isFeatured: false,
      featuredRank: null,
      categoryId: security.id
    },

    // Lighting
    {
      slug: 'smart-color-bulb-rgbw',
      name: 'Smart Color Bulb RGBW',
      description: 'Dimmable 16 million colors LED smart light bulb with scheduling, circadian rhythms, and app control.',
      priceIdr: 120000,
      imageUrl: '/images/product-hub.png',
      kind: 'DEVICE' as const,
      status: 'ACTIVE' as const,
      isFeatured: true,
      featuredRank: 5,
      categoryId: lighting.id
    },
    {
      slug: 'smart-rgb-led-strip-5m',
      name: 'Smart RGB LED Strip 5M',
      description: 'Cuttable and extendable addressable LED strip with music sync, adhesive backing, and power adapter.',
      priceIdr: 280000,
      imageUrl: '/images/product-lock.png',
      kind: 'DEVICE' as const,
      status: 'ACTIVE' as const,
      isFeatured: false,
      featuredRank: null,
      categoryId: lighting.id
    },
    {
      slug: 'smart-wall-touch-switch-2gang',
      name: 'Smart Wall Touch Switch 2-Gang',
      description: 'Tempered glass touch switch compatible with neutral and non-neutral wiring with LED status backlight.',
      priceIdr: 175000,
      imageUrl: '/images/product-hub.png',
      kind: 'DEVICE' as const,
      status: 'ACTIVE' as const,
      isFeatured: false,
      featuredRank: null,
      categoryId: lighting.id
    },
    {
      slug: 'smart-dimmer-module',
      name: 'Smart In-Wall Dimmer Module',
      description: 'Mini flush-mounted dimmer module that converts regular mechanical wall switches into smart dimmers.',
      priceIdr: 145000,
      imageUrl: '/images/product-lock.png',
      kind: 'DEVICE' as const,
      status: 'ACTIVE' as const,
      isFeatured: false,
      featuredRank: null,
      categoryId: lighting.id
    },

    // Audio & Speakers
    {
      slug: 'smart-surround-soundbar',
      name: 'Smart Surround Soundbar Pro',
      description: 'Spatial audio soundbar with Dolby Atmos support, multi-room wireless synchronization, and eARC input.',
      priceIdr: 1250000,
      imageUrl: '/images/product-lock.png',
      kind: 'DEVICE' as const,
      status: 'ACTIVE' as const,
      isFeatured: true,
      featuredRank: 6,
      categoryId: audio.id
    },
    {
      slug: 'smart-ceiling-speaker-pair',
      name: 'Smart In-Ceiling Speaker Pair',
      description: 'Flush-mount architectural speakers with moisture resistance, Kevlar woofers, and magnetic paintable grilles.',
      priceIdr: 950000,
      imageUrl: '/images/product-hub.png',
      kind: 'DEVICE' as const,
      status: 'ACTIVE' as const,
      isFeatured: false,
      featuredRank: null,
      categoryId: audio.id
    },
    {
      slug: 'smart-wifi-audio-amplifier',
      name: 'Multi-Room Wi-Fi Audio Amplifier',
      description: 'Compact 2x50W stereo streaming amplifier supporting AirPlay 2, Spotify Connect, and optical in.',
      priceIdr: 890000,
      imageUrl: '/images/product-lock.png',
      kind: 'DEVICE' as const,
      status: 'ACTIVE' as const,
      isFeatured: false,
      featuredRank: null,
      categoryId: audio.id
    }
  ];

  for (const prod of products) {
    await db.orm.public.Product.create(prod);
  }

  // 4. Users
  const adminPasswordHash = await bcrypt.hash('AdminPassword123', 10);
  await db.orm.public.User.create({
    fullName: 'Admin Handy Mandy',
    email: 'admin@handymandy.id',
    phone: '+628111222333',
    passwordHash: adminPasswordHash,
    role: 'ADMIN'
  });

  const customerPasswordHash = await bcrypt.hash('CustomerPassword123', 10);
  const customer = await db.orm.public.User.create({
    fullName: 'Sofia Marchetti',
    email: 'customer@handymandy.id',
    phone: '+6281234567890',
    passwordHash: customerPasswordHash,
    role: 'CUSTOMER'
  });

  // 5. Default address for customer
  const defaultAddress = await db.orm.public.Address.create({
    userId: customer.id,
    province: 'Jawa Timur',
    city: 'Surabaya',
    district: 'Kec Rungkut',
    addressLine: 'Gang Menanggal Harapan VII No. 12',
    postalCode: '60872',
    notes: 'Near the white gate, call upon arrival',
    isDefault: true
  });

  // Second address for selection
  await db.orm.public.Address.create({
    userId: customer.id,
    province: 'Jawa Timur',
    city: 'Surabaya',
    district: 'Kec Sukolilo',
    addressLine: 'Jl. Gebang Wetan No. 45',
    postalCode: '60111',
    notes: 'House with green car porch',
    isDefault: false
  });

  // 6. Technicians in Surabaya
  const techniciansData = [
    {
      fullName: 'Thaariq Cahya',
      avatarUrl: '/images/tech-thaariq.png',
      city: 'Surabaya',
      ratingAvg: '5.0',
      ratingCount: 48,
      highlight: '*teknisi paling nggambas',
      availability: 'AVAILABLE' as const,
      areas: ['Menanggal Area', 'Rungkut Area']
    },
    {
      fullName: 'Rezvan Budi',
      avatarUrl: '/images/tech-rezvan.png',
      city: 'Surabaya',
      ratingAvg: '4.6',
      ratingCount: 32,
      highlight: 'Fast response & tidy cable management',
      availability: 'AVAILABLE' as const,
      areas: ['Keputih Area', 'Sukolilo Area']
    },
    {
      fullName: 'Bambang Pratama',
      avatarUrl: '/images/tech-third.png',
      city: 'Surabaya',
      ratingAvg: '2.0',
      ratingCount: 11,
      highlight: 'Experienced smart hardware technician',
      availability: 'AVAILABLE' as const,
      areas: ['Manyar Area', 'Gubeng Area']
    },
    {
      fullName: 'Dimas Anggara',
      avatarUrl: '/images/tech-thaariq.png',
      city: 'Surabaya',
      ratingAvg: '4.9',
      ratingCount: 64,
      highlight: 'Certified smart electrical installer',
      availability: 'AVAILABLE' as const,
      areas: ['Dukuh Pakis Area', 'Wiyung Area']
    },
    {
      fullName: 'Eko Prasetyo',
      avatarUrl: '/images/tech-rezvan.png',
      city: 'Surabaya',
      ratingAvg: '4.8',
      ratingCount: 41,
      highlight: 'Detailed device pairing setup and tutorial',
      availability: 'UNAVAILABLE' as const,
      areas: ['Tegalsari Area', 'Wonokromo Area']
    },
    {
      fullName: 'Fajar Kurniawan',
      avatarUrl: '/images/tech-third.png',
      city: 'Surabaya',
      ratingAvg: '4.7',
      ratingCount: 29,
      highlight: 'Expert in network mesh & audio setup',
      availability: 'AVAILABLE' as const,
      areas: ['Kenjeran Area', 'Tambaksari Area']
    }
  ];

  for (const tech of techniciansData) {
    const { areas, ...techFields } = tech;
    const createdTech = await db.orm.public.Technician.create(techFields);
    for (const area of areas) {
      await db.orm.public.TechnicianServiceArea.create({
        technicianId: createdTech.id,
        area
      });
    }
  }

  // 7. Seed one sample booking in PENDING_ASSIGNMENT for customer to test technician assignment
  const sampleOrder = await db.orm.public.Order.create({
    orderNumber: 'HM-261002-0042',
    userId: customer.id,
    addressId: defaultAddress.id,
    addressSnapshot: {
      province: defaultAddress.province,
      city: defaultAddress.city,
      district: defaultAddress.district,
      addressLine: defaultAddress.addressLine,
      postalCode: defaultAddress.postalCode,
      notes: defaultAddress.notes
    },
    status: 'PENDING_ASSIGNMENT',
    includeInstallation: true,
    preferredDate: '2026-10-15',
    specialInstructions: 'Please ring bell upon arrival.',
    devicesSubtotalIdr: 450000,
    installationFeeIdr: 150000,
    addOnsIdr: 0,
    totalIdr: 600000,
    estimatedFinishDate: '2026-10-16',
    paidAt: Temporal.Instant.fromEpochMilliseconds(Date.now())
  });

  await db.orm.public.OrderItem.create({
    orderId: sampleOrder.id,
    lineType: 'DEVICE',
    nameSnapshot: 'Zigbee Multi-Protocol Gateway Hub Gen 3',
    imageSnapshot: '/images/product-hub.png',
    unitPriceIdr: 450000,
    quantity: 1,
    lineTotalIdr: 450000
  });

  await db.orm.public.OrderItem.create({
    orderId: sampleOrder.id,
    lineType: 'INSTALLATION',
    nameSnapshot: 'Professional Technician Installation',
    imageSnapshot: null,
    unitPriceIdr: 150000,
    quantity: 1,
    lineTotalIdr: 150000
  });

  console.log(`✅ Seed completed successfully!`);
  console.log(`   Admin: admin@handymandy.id / AdminPassword123`);
  console.log(`   Customer: customer@handymandy.id / CustomerPassword123`);
  console.log(`   Sample Order ID: ${sampleOrder.id} (${sampleOrder.orderNumber})`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.close();
  });
