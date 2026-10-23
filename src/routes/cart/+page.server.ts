import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { loadUserCart } from '$lib/server/cart';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return {
      items: [],
      subtotalIdr: 0,
      itemCount: 0
    };
  }

  const cart = await loadUserCart(locals.user.id);
  return {
    items: cart.items,
    subtotalIdr: cart.subtotalIdr,
    itemCount: cart.itemCount
  };
};

export const actions: Actions = {
  proceedCheckout: async ({ request, locals, cookies }) => {
    if (!locals.user) {
      throw redirect(303, '/login?next=/cart');
    }

    const formData = await request.formData();
    const rawIds = formData.getAll('selectedItemId').map(String).filter(Boolean);

    if (rawIds.length === 0) {
      return fail(400, { message: 'Please select at least one item to check out.' });
    }

    // Verify selected items belong to user and are active
    const userItems = await db.orm.public.CartItem
      .where({ userId: locals.user.id })
      .include('product')
      .all();

    const validIds = userItems
      .filter((item) => rawIds.includes(item.id) && item.product && item.product.status === 'ACTIVE')
      .map((item) => item.id);

    if (validIds.length === 0) {
      return fail(400, { message: 'None of the selected items are available for checkout.' });
    }

    cookies.set('hm_checkout_items', JSON.stringify(validIds), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    });

    throw redirect(303, '/checkout/location');
  },

  remove: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const itemId = String(formData.get('itemId') || '');

    if (!itemId) {
      return fail(400, { message: 'Item ID missing' });
    }

    const item = await db.orm.public.CartItem.where({ id: itemId }).first();

    if (item && item.userId === locals.user.id) {
      await db.orm.public.CartItem.where({ id: itemId }).delete();
    }

    return { success: true };
  }
};
