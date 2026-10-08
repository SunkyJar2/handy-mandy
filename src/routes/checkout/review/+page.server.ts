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
    db.orm.public.CartItem
      .where({ userId: locals.user.id })
      .include('product')
      .all(),
    db.orm.public.Address
      .where({ id: addressId })
      .first()
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
    address: {
      id: address.id,
      userId: address.userId,
      province: address.province,
      city: address.city,
      district: address.district,
      addressLine: address.addressLine,
      postalCode: address.postalCode,
      notes: address.notes,
      isDefault: address.isDefault,
      createdAt: address.createdAt ? new Date(address.createdAt.epochMilliseconds).toISOString() : ''
    },
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
    const currentUser = locals.user;
    if (!currentUser) {
      return fail(401, { message: 'Unauthorized' });
    }

    const addressId = cookies.get('hm_checkout_address');
    if (!addressId) {
      return fail(400, { message: 'Missing installation address' });
    }

    const [cartItems, address] = await Promise.all([
      db.orm.public.CartItem
        .where({ userId: currentUser.id })
        .include('product')
        .all(),
      db.orm.public.Address
        .where({ id: addressId })
        .first()
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
    const preferredDate = savedOptions.preferredDate ? String(savedOptions.preferredDate).slice(0, 10) : null;
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

    let todayOrderCount = 0;
    try {
      const agg = await db.orm.public.Order
        .where((o) => o.orderNumber.like(`${datePrefix}%`))
        .aggregate((a) => ({ count: a.count() }));
      todayOrderCount = Number(agg.count ?? 0);
    } catch {
      todayOrderCount = 0;
    }

    const sequence = String(todayOrderCount + 1).padStart(4, '0');
    const orderNumber = `${datePrefix}-${sequence}`;

    // Create Order and OrderItems in a transaction
    const order = await db.transaction(async (tx) => {
      const newOrder = await tx.orm.public.Order.create({
        orderNumber,
        userId: currentUser.id,
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
        totalIdr: quote.totalIdr
      });

      for (const ci of cartItems) {
        if (!ci.product) continue;
        await tx.orm.public.OrderItem.create({
          orderId: newOrder.id,
          lineType: 'DEVICE',
          productId: ci.productId,
          nameSnapshot: ci.product.name,
          imageSnapshot: ci.product.imageUrl,
          unitPriceIdr: ci.product.priceIdr,
          quantity: ci.quantity,
          lineTotalIdr: ci.product.priceIdr * ci.quantity
        });
      }

      if (includeInstallation) {
        await tx.orm.public.OrderItem.create({
          orderId: newOrder.id,
          lineType: 'INSTALLATION',
          nameSnapshot: 'Professional Technician Installation',
          imageSnapshot: null,
          unitPriceIdr: INSTALL_FEE_PER_UNIT_IDR,
          quantity: quote.deviceCount,
          lineTotalIdr: quote.installationFeeIdr
        });
      }

      if (includeHub) {
        await tx.orm.public.OrderItem.create({
          orderId: newOrder.id,
          lineType: 'ADDON',
          nameSnapshot: 'Zigbee Multi-Protocol Gateway Hub Gen 3',
          imageSnapshot: '/images/product-hub.png',
          unitPriceIdr: HUB_PRICE_IDR,
          quantity: 1,
          lineTotalIdr: HUB_PRICE_IDR
        });
      }

      return newOrder;
    });

    // Create Payment Session
    const paymentProvider = getPaymentProvider();
    const paymentResult = await paymentProvider.createPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountIdr: order.totalIdr,
      customer: {
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.phone
      }
    });

    await db.orm.public.Payment.create({
      orderId: order.id,
      provider: paymentResult.provider,
      providerRef: paymentResult.token,
      status: 'PENDING',
      amountIdr: order.totalIdr
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
