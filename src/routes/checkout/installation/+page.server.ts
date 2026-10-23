import { redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { toIsoDateTime } from '$lib/server/date';
import { calculateQuote } from '$lib/shared/pricing';
import { parseCheckoutOptionsCookie } from '$lib/shared/checkout';
import { checkoutOptionsSchema } from '$lib/shared/schemas';
import { parseSelectedCartItemIds, filterCheckoutCartItems } from '$lib/shared/cart-selection';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  if (!locals.user) {
    throw redirect(303, '/login?next=/checkout/installation');
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

  if (cartItems.length === 0) {
    throw redirect(303, '/cart');
  }
  if (!address) {
    throw redirect(303, '/checkout/location');
  }

  // Load existing options from cookies or defaults
  const savedOptionsRaw = cookies.get('hm_checkout_options');
  const savedOptions = parseCheckoutOptionsCookie(savedOptionsRaw);

  const includeInstallation = savedOptions.includeInstallation;
  const includeHub = savedOptions.includeHub;
  const preferredDate = savedOptions.preferredDate;
  const specialInstructions = savedOptions.specialInstructions ?? '';

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
    initialQuote: quote
  };
};

export const actions: Actions = {
  saveOptions: async ({ request, cookies }) => {
    const formData = await request.formData();
    const includeInstallation = formData.get('includeInstallation') === 'true';
    const includeHub = formData.get('includeHub') === 'true';
    const preferredDate = String(formData.get('preferredDate') || '') || null;
    const specialInstructions = String(formData.get('specialInstructions') || '').trim() || null;

    const parseResult = checkoutOptionsSchema.safeParse({
      includeInstallation,
      includeHub,
      preferredDate,
      specialInstructions
    });

    if (!parseResult.success) {
      return fail(422, {
        message: parseResult.error.issues[0]?.message || 'Invalid checkout options.'
      });
    }

    cookies.set(
      'hm_checkout_options',
      JSON.stringify(parseResult.data),
      {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24
      }
    );

    throw redirect(303, '/checkout/review');
  }
};
