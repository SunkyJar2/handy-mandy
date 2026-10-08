import { redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  if (!locals.user) {
    throw redirect(303, '/login?next=/checkout/location');
  }

  const [cartItems, addresses] = await Promise.all([
    db.orm.public.CartItem
      .where({ userId: locals.user.id })
      .include('product')
      .all(),
    db.orm.public.Address
      .where({ userId: locals.user.id })
      .orderBy((a) => a.createdAt.desc())
      .all()
  ]);

  if (cartItems.length === 0) {
    throw redirect(303, '/cart');
  }

  let devicesTotalIdr = 0;
  for (const item of cartItems) {
    if (item.product && item.product.status === 'ACTIVE') {
      devicesTotalIdr += item.product.priceIdr * item.quantity;
    }
  }

  const mappedAddresses = addresses
    .map((a) => ({
      id: a.id,
      userId: a.userId,
      province: a.province,
      city: a.city,
      district: a.district,
      addressLine: a.addressLine,
      postalCode: a.postalCode,
      notes: a.notes,
      isDefault: a.isDefault,
      createdAt: a.createdAt ? new Date(a.createdAt.epochMilliseconds).toISOString() : ''
    }))
    .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

  const savedAddressId = cookies.get('hm_checkout_address') || mappedAddresses[0]?.id || '';

  return {
    cartItems: cartItems
      .filter((ci) => ci.product !== null)
      .map((ci) => ({
        id: ci.id,
        quantity: ci.quantity,
        product: {
          id: ci.product!.id,
          name: ci.product!.name,
          priceIdr: ci.product!.priceIdr,
          imageUrl: ci.product!.imageUrl
        }
      })),
    addresses: mappedAddresses,
    devicesTotalIdr,
    savedAddressId
  };
};

export const actions: Actions = {
  selectAddress: async ({ request, cookies }) => {
    const formData = await request.formData();
    const addressId = String(formData.get('addressId') || '');

    if (!addressId) {
      return fail(400, { message: 'Please select an installation address.' });
    }

    cookies.set('hm_checkout_address', addressId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    });

    throw redirect(303, '/checkout/installation');
  }
};
