import { redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { calculateQuote, INSTALL_FEE_PER_UNIT_IDR, HUB_PRICE_IDR } from '$lib/shared/pricing';
import { getPaymentProvider } from '$lib/server/payment';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  if (!locals.user) {
    throw redirect(303, '/login?next=/checkout/review');
  }

  const addressId = cookies.get('hm_checkout_address');
  if (!addressId) {
    throw redirect(303, '/checkout/location');
  }

  const [cartItems, address] = await Promise.all([
    db.cartItem.findMany({
      where: { userId: locals.user.id },
      include: { product: true }
    }),
    db.address.findUnique({
      where: { id: addressId }
    })
  ]);

  if (cartItems.length === 0) {
    throw redirect(303, '/cart');
  }
  if (!address) {
    throw redirect(303, '/checkout/location');
  }

  const savedOptionsRaw = cookies.get('hm_checkout_options');
  const savedOptions = savedOptionsRaw ? JSON.parse(savedOptionsRaw) : {};

  const includeInstallation = savedOptions.includeInstallation ?? true;
  const includeHub = savedOptions.includeHub ?? false;
  const preferredDate = savedOptions.preferredDate ?? null;
  const specialInstructions = savedOptions.specialInstructions ?? null;

  const quote = calculateQuote({
    items: cartItems.map((ci) => ({
      priceIdr: ci.product.priceIdr,
      quantity: ci.quantity
    })),
    includeInstallation,
    includeHub
  });

  return {
    address,
    cartItemsCount: cartItems.reduce((acc, ci) => acc + ci.quantity, 0),
    includeInstallation,
    includeHub,
    preferredDate,
    specialInstructions,
    quote
  };
};

export const actions: Actions = {
  createOrder: async ({ locals, cookies }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    const addressId = cookies.get('hm_checkout_address');
    if (!addressId) {
      return fail(400, { message: 'Missing installation address' });
    }

    const [cartItems, address] = await Promise.all([
      db.cartItem.findMany({
        where: { userId: locals.user.id },
        include: { product: true }
      }),
      db.address.findUnique({
        where: { id: addressId }
      })
    ]);

    if (cartItems.length === 0) {
      return fail(409, { message: 'Your cart is empty' });
    }
    if (!address) {
      return fail(404, { message: 'Address not found' });
    }

    const savedOptionsRaw = cookies.get('hm_checkout_options');
    const savedOptions = savedOptionsRaw ? JSON.parse(savedOptionsRaw) : {};
    const includeInstallation = savedOptions.includeInstallation ?? true;
    const includeHub = savedOptions.includeHub ?? false;
    const preferredDate = savedOptions.preferredDate ? new Date(savedOptions.preferredDate) : null;
    const specialInstructions = savedOptions.specialInstructions ?? null;

    // Server authoritative recomputation
    const quote = calculateQuote({
      items: cartItems.map((ci) => ({
        priceIdr: ci.product.priceIdr,
        quantity: ci.quantity
      })),
      includeInstallation,
      includeHub
    });

    // Generate Order Number: HM-YYMMDD-NNNN
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `HM-${yy}${mm}${dd}`;

    const todayOrderCount = await db.order.count({
      where: {
        orderNumber: { startsWith: datePrefix }
      }
    });

    const sequence = String(todayOrderCount + 1).padStart(4, '0');
    const orderNumber = `${datePrefix}-${sequence}`;

    // Create Order with Items
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: locals.user.id,
        addressId: address.id,
        addressSnapshot: {
          province: address.province,
          city: address.city,
          district: address.district,
          addressLine: address.addressLine,
          postalCode: address.postalCode,
          notes: address.notes
        },
        status: 'PENDING_PAYMENT',
        includeInstallation,
        preferredDate,
        specialInstructions,
        devicesSubtotalIdr: quote.devicesSubtotalIdr,
        installationFeeIdr: quote.installationFeeIdr,
        addOnsIdr: quote.addOnsIdr,
        totalIdr: quote.totalIdr,
        items: {
          create: [
            ...cartItems.map((ci) => ({
              lineType: 'DEVICE' as const,
              productId: ci.productId,
              nameSnapshot: ci.product.name,
              imageSnapshot: ci.product.imageUrl,
              unitPriceIdr: ci.product.priceIdr,
              quantity: ci.quantity,
              lineTotalIdr: ci.product.priceIdr * ci.quantity
            })),
            ...(includeInstallation
              ? [
                  {
                    lineType: 'INSTALLATION' as const,
                    nameSnapshot: 'Professional Technician Installation',
                    imageSnapshot: null,
                    unitPriceIdr: INSTALL_FEE_PER_UNIT_IDR,
                    quantity: quote.deviceCount,
                    lineTotalIdr: quote.installationFeeIdr
                  }
                ]
              : []),
            ...(includeHub
              ? [
                  {
                    lineType: 'ADDON' as const,
                    nameSnapshot: 'Zigbee Multi-Protocol Gateway Hub Gen 3',
                    imageSnapshot: '/images/product-hub.png',
                    unitPriceIdr: HUB_PRICE_IDR,
                    quantity: 1,
                    lineTotalIdr: HUB_PRICE_IDR
                  }
                ]
              : [])
          ]
        }
      }
    });

    // Create Payment Session
    const paymentProvider = getPaymentProvider();
    const paymentResult = await paymentProvider.createPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountIdr: order.totalIdr,
      customer: {
        fullName: locals.user.fullName,
        email: locals.user.email,
        phone: locals.user.phone
      }
    });

    await db.payment.create({
      data: {
        orderId: order.id,
        provider: paymentResult.provider,
        providerRef: paymentResult.token,
        status: 'PENDING',
        amountIdr: order.totalIdr
      }
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalIdr: order.totalIdr,
      payment: paymentResult
    };
  }
};
