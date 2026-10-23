import { redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { toIsoDateTime } from '$lib/server/date';
import { calculateQuote, INSTALL_FEE_PER_UNIT_IDR, HUB_PRICE_IDR } from '$lib/shared/pricing';
import { getPaymentProvider } from '$lib/server/payment';
import { parseCheckoutOptionsCookie } from '$lib/shared/checkout';
import { validateActiveCartItems, nextOrderNumberFromMax } from '$lib/server/guards';
import { parseSelectedCartItemIds, filterCheckoutCartItems } from '$lib/shared/cart-selection';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  if (!locals.user) {
    throw redirect(303, '/login?next=/checkout/review');
  }

  const addressId = cookies.get('hm_checkout_address');
  if (!addressId) {
    throw redirect(303, '/checkout/location');
  }

  const [rawCartItems, address] = await Promise.all([
    db.orm.public.CartItem
      .where({ userId: locals.user.id })
      .include('product')
      .all(),
    db.orm.public.Address
      .where({ id: addressId, userId: locals.user.id })
      .first()
  ]);

  const selectedIds = parseSelectedCartItemIds(cookies.get('hm_checkout_items'));
  const cartItems = filterCheckoutCartItems(rawCartItems, selectedIds);

  if (!validateActiveCartItems(cartItems)) {
    throw redirect(303, '/cart');
  }
  if (!address) {
    throw redirect(303, '/checkout/location');
  }

  const savedOptionsRaw = cookies.get('hm_checkout_options');
  const savedOptions = parseCheckoutOptionsCookie(savedOptionsRaw);

  const includeInstallation = savedOptions.includeInstallation;
  const includeHub = savedOptions.includeHub;
  const preferredDate = savedOptions.preferredDate;
  const specialInstructions = savedOptions.specialInstructions;

  const quote = calculateQuote({
    items: cartItems.map((ci) => ({
      priceIdr: ci.product!.priceIdr,
      quantity: ci.quantity
    })),
    includeInstallation,
    includeHub
  });

  return {
    address: {
      id: address.id,
      userId: address.userId,
      label: address.label ?? null,
      province: address.province,
      city: address.city,
      district: address.district,
      addressLine: address.addressLine,
      postalCode: address.postalCode,
      notes: address.notes,
      isDefault: address.isDefault,
      createdAt: toIsoDateTime(address.createdAt)
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

    const [rawCartItems, address] = await Promise.all([
      db.orm.public.CartItem
        .where({ userId: currentUser.id })
        .include('product')
        .all(),
      db.orm.public.Address
        .where({ id: addressId, userId: currentUser.id })
        .first()
    ]);

    const selectedIds = parseSelectedCartItemIds(cookies.get('hm_checkout_items'));
    const cartItems = filterCheckoutCartItems(rawCartItems, selectedIds);

    if (!validateActiveCartItems(cartItems)) {
      return fail(409, { message: 'Some items in your cart are no longer available. Please review your cart.' });
    }
    if (!address) {
      return fail(404, { message: 'Address not found' });
    }

    const savedOptionsRaw = cookies.get('hm_checkout_options');
    const savedOptions = parseCheckoutOptionsCookie(savedOptionsRaw);
    const includeInstallation = savedOptions.includeInstallation;
    const includeHub = savedOptions.includeHub;
    const preferredDate = savedOptions.preferredDate;
    const specialInstructions = savedOptions.specialInstructions;

    // Server authoritative recomputation
    const quote = calculateQuote({
      items: cartItems.map((ci) => ({
        priceIdr: ci.product!.priceIdr,
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

    let existingOrderNumbers: string[] = [];
    try {
      const orders = await db.orm.public.Order
        .where((o) => o.orderNumber.like(`${datePrefix}%`))
        .all();
      existingOrderNumbers = orders.map((o) => o.orderNumber);
    } catch {
      existingOrderNumbers = [];
    }

    const orderNumber = nextOrderNumberFromMax(datePrefix, existingOrderNumbers);

    // Create Order and OrderItems in a transaction
    const order = await db.transaction(async (tx) => {
      const newOrder = await tx.orm.public.Order.create({
        orderNumber,
        userId: currentUser.id,
        addressId: address.id,
        addressSnapshot: {
          label: address.label ?? null,
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
