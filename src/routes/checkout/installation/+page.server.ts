import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { calculateQuote } from '$lib/shared/pricing';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  if (!locals.user) {
    throw redirect(303, '/login?next=/checkout/installation');
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

  // Load existing options from cookies or defaults
  const savedOptionsRaw = cookies.get('hm_checkout_options');
  const savedOptions = savedOptionsRaw ? JSON.parse(savedOptionsRaw) : {};

  const includeInstallation = savedOptions.includeInstallation ?? true;
  const includeHub = savedOptions.includeHub ?? false;
  const preferredDate = savedOptions.preferredDate ?? null;
  const specialInstructions = savedOptions.specialInstructions ?? '';

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

    cookies.set(
      'hm_checkout_options',
      JSON.stringify({
        includeInstallation,
        includeHub,
        preferredDate,
        specialInstructions
      }),
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
