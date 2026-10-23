import { redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { toIsoDateTime } from '$lib/server/date';
import { resolveUserAddressId } from '$lib/server/guards';
import { parseSelectedCartItemIds, filterCheckoutCartItems } from '$lib/shared/cart-selection';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  if (!locals.user) {
    throw redirect(303, '/login?next=/checkout/location');
  }

  const [rawCartItems, addresses] = await Promise.all([
    db.orm.public.CartItem
      .where({ userId: locals.user.id })
      .include('product')
      .all(),
    db.orm.public.Address
      .where({ userId: locals.user.id })
      .orderBy((a) => a.createdAt.desc())
      .all()
  ]);

  const selectedIds = parseSelectedCartItemIds(cookies.get('hm_checkout_items'));
  const cartItems = filterCheckoutCartItems(rawCartItems, selectedIds);

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
      label: a.label ?? null,
      province: a.province,
      city: a.city,
      district: a.district,
      addressLine: a.addressLine,
      postalCode: a.postalCode,
      notes: a.notes,
      isDefault: a.isDefault,
      createdAt: toIsoDateTime(a.createdAt)
    }))
    .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

  const savedAddressId = resolveUserAddressId(cookies.get('hm_checkout_address'), mappedAddresses);

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
  selectAddress: async ({ request, cookies, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const addressId = String(formData.get('addressId') || '');

    if (!addressId) {
      return fail(400, { message: 'Please select an installation address.' });
    }

    const address = await db.orm.public.Address.where({
      id: addressId,
      userId: locals.user.id
    }).first();

    if (!address) {
      return fail(404, { message: 'Selected address not found.' });
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
