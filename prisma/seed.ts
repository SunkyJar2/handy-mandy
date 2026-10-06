import { PrismaClient, Role, ProductKind, ProductStatus, TechnicianAvailability } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing records in reverse dependency order
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.session.deleteMany();
  await prisma.address.deleteMany();
  await prisma.technicianServiceArea.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Categories
  const lighting = await prisma.category.create({
    data: { slug: 'lighting', name: 'Lighting', sortOrder: 1 }
  });
  const security = await prisma.category.create({
    data: { slug: 'security', name: 'Security', sortOrder: 2 }
  });
  const audio = await prisma.category.create({
    data: { slug: 'audio', name: 'Audio', sortOrder: 3 }
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
      kind: ProductKind.ADDON,
      status: ProductStatus.ACTIVE,
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
      kind: ProductKind.DEVICE,
      status: ProductStatus.ACTIVE,
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
      kind: ProductKind.DEVICE,
      status: ProductStatus.ACTIVE,
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
      kind: ProductKind.DEVICE,
      status: ProductStatus.ACTIVE,
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
      kind: ProductKind.DEVICE,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      categoryId: security.id
    },

    // Lighting
    {
      slug: 'smart-color-bulb-rgbw',
      name: 'Smart Color Bulb RGBW',
      description: 'Dimmable 16 million colors LED smart light bulb with scheduling, circadian rhythms, and app control.',
      priceIdr: 150000,
      imageUrl: '/images/product-lock.png',
      kind: ProductKind.DEVICE,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      featuredRank: 5,
      categoryId: lighting.id
    },
    {
      slug: 'ambient-smart-led-lightstrip',
      name: 'Ambient Smart LED Lightstrip (2m)',
      description: 'Flexible cuttable addressable RGBIC neon gradient lightstrip with music synchronization and preset scenes.',
      priceIdr: 280000,
      imageUrl: '/images/product-hub.png',
      kind: ProductKind.DEVICE,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      featuredRank: 6,
      categoryId: lighting.id
    },
    {
      slug: 'smart-flush-ceiling-light',
      name: 'Smart Flush Ceiling Light',
      description: 'Ultra-thin warm to cool white ceiling fixture with gradual wake-up lighting and dustproof seal.',
      priceIdr: 420000,
      imageUrl: '/images/product-lock.png',
      kind: ProductKind.DEVICE,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      categoryId: lighting.id
    },
    {
      slug: 'smart-touch-wall-dimmer',
      name: 'Smart Touch Wall Dimmer Switch',
      description: 'Capacitive touch glass front smart dimmer switch with subtle LED backlight and automation scene triggers.',
      priceIdr: 210000,
      imageUrl: '/images/product-hub.png',
      kind: ProductKind.DEVICE,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      categoryId: lighting.id
    },

    // Audio
    {
      slug: 'smart-spatial-soundbar',
      name: 'Smart Spatial Soundbar Dolby Atmos',
      description: 'High-fidelity cinema soundbar with integrated smart multi-room wireless audio and voice assistant.',
      priceIdr: 1250000,
      imageUrl: '/images/product-hub.png',
      kind: ProductKind.DEVICE,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      featuredRank: 7,
      categoryId: audio.id
    },
    {
      slug: 'smart-wireless-audio-streamer',
      name: 'Smart Wireless Audio Streamer',
      description: 'Lossless streaming preamplifier with Hi-Res DAC that upgrades traditional amplifiers to smart wireless sound.',
      priceIdr: 890000,
      imageUrl: '/images/product-lock.png',
      kind: ProductKind.DEVICE,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      categoryId: audio.id
    },
    {
      slug: 'in-ceiling-smart-speaker',
      name: 'In-Ceiling Smart Architectural Speaker',
      description: 'Flush-mount 6.5-inch 2-way ceiling speaker with paintable magnetic grille and moisture-resistant cone.',
      priceIdr: 480000,
      imageUrl: '/images/product-hub.png',
      kind: ProductKind.DEVICE,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      categoryId: audio.id
    },
    {
      slug: 'smart-compact-subwoofer',
      name: 'Smart Wireless Compact Subwoofer',
      description: 'Deep resonant bass wireless subwoofer with dual force-canceling drivers and auto room acoustic calibration.',
      priceIdr: 950000,
      imageUrl: '/images/product-lock.png',
      kind: ProductKind.DEVICE,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      categoryId: audio.id
    }
  ];

  for (const prod of products) {
    await prisma.product.create({ data: prod });
  }

  // 4. Users
  const adminPasswordHash = await bcrypt.hash('AdminPassword123', 10);
  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin Handy Mandy',
      email: 'admin@handymandy.id',
      phone: '+628111222333',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    }
  });

  const customerPasswordHash = await bcrypt.hash('CustomerPassword123', 10);
  const customer = await prisma.user.create({
    data: {
      fullName: 'Sofia Marchetti',
      email: 'customer@handymandy.id',
      phone: '+6281234567890',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER
    }
  });

  // 5. Default address for customer
  const defaultAddress = await prisma.address.create({
    data: {
      userId: customer.id,
      province: 'Jawa Timur',
      city: 'Surabaya',
      district: 'Kec Rungkut',
      addressLine: 'Gang Menanggal Harapan VII No. 12',
      postalCode: '60872',
      notes: 'Near the white gate, call upon arrival',
      isDefault: true
    }
  });

  // Second address for selection
  await prisma.address.create({
    data: {
      userId: customer.id,
      province: 'Jawa Timur',
      city: 'Surabaya',
      district: 'Kec Sukolilo',
      addressLine: 'Jl. Gebang Wetan No. 45',
      postalCode: '60111',
      notes: 'House with green car porch',
      isDefault: false
    }
  });

  // 6. Technicians in Surabaya
  const techniciansData = [
    {
      fullName: 'Thaariq Cahya',
      avatarUrl: '/images/tech-thaariq.png',
      city: 'Surabaya',
      ratingAvg: 5.0,
      ratingCount: 48,
      highlight: '*teknisi paling nggambas',
      availability: TechnicianAvailability.AVAILABLE,
      areas: ['Menanggal Area', 'Rungkut Area']
    },
    {
      fullName: 'Rezvan Budi',
      avatarUrl: '/images/tech-rezvan.png',
      city: 'Surabaya',
      ratingAvg: 4.6,
      ratingCount: 32,
      highlight: 'Fast response & tidy cable management',
      availability: TechnicianAvailability.AVAILABLE,
      areas: ['Keputih Area', 'Sukolilo Area']
    },
    {
      fullName: 'Bambang Pratama',
      avatarUrl: '/images/tech-third.png',
      city: 'Surabaya',
      ratingAvg: 2.0,
      ratingCount: 11,
      highlight: 'Experienced smart hardware technician',
      availability: TechnicianAvailability.AVAILABLE,
      areas: ['Manyar Area', 'Gubeng Area']
    },
    {
      fullName: 'Dimas Anggara',
      avatarUrl: '/images/tech-thaariq.png',
      city: 'Surabaya',
      ratingAvg: 4.9,
      ratingCount: 64,
      highlight: 'Certified smart electrical installer',
      availability: TechnicianAvailability.AVAILABLE,
      areas: ['Dukuh Pakis Area', 'Wiyung Area']
    },
    {
      fullName: 'Eko Prasetyo',
      avatarUrl: '/images/tech-rezvan.png',
      city: 'Surabaya',
      ratingAvg: 4.8,
      ratingCount: 41,
      highlight: 'Detailed device pairing setup and tutorial',
      availability: TechnicianAvailability.UNAVAILABLE,
      areas: ['Tegalsari Area', 'Wonokromo Area']
    },
    {
      fullName: 'Fajar Kurniawan',
      avatarUrl: '/images/tech-third.png',
      city: 'Surabaya',
      ratingAvg: 4.7,
      ratingCount: 29,
      highlight: 'Expert in network mesh & audio setup',
      availability: TechnicianAvailability.AVAILABLE,
      areas: ['Kenjeran Area', 'Tambaksari Area']
    }
  ];

  for (const tech of techniciansData) {
    const { areas, ...techFields } = tech;
    const createdTech = await prisma.technician.create({
      data: techFields
    });
    for (const area of areas) {
      await prisma.technicianServiceArea.create({
        data: {
          technicianId: createdTech.id,
          area
        }
      });
    }
  }

  // 7. Seed one sample booking in PENDING_ASSIGNMENT for customer to test technician assignment
  const hubProduct = products.find((p) => p.slug === 'zigbee-gateway-hub-gen3')!;
  const sampleOrder = await prisma.order.create({
    data: {
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
      preferredDate: new Date('2026-10-15'),
      specialInstructions: 'Please ring bell upon arrival.',
      devicesSubtotalIdr: 450000,
      installationFeeIdr: 150000,
      addOnsIdr: 0,
      totalIdr: 600000,
      estimatedFinishDate: new Date('2026-10-16'),
      paidAt: new Date(),
      items: {
        create: [
          {
            lineType: 'DEVICE',
            nameSnapshot: 'Zigbee Multi-Protocol Gateway Hub Gen 3',
            imageSnapshot: '/images/product-hub.png',
            unitPriceIdr: 450000,
            quantity: 1,
            lineTotalIdr: 450000
          },
          {
            lineType: 'INSTALLATION',
            nameSnapshot: 'Professional Technician Installation',
            unitPriceIdr: 150000,
            quantity: 1,
            lineTotalIdr: 150000
          }
        ]
      }
    }
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
    await prisma.$disconnect();
  });
