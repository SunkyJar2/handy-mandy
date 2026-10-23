import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { loadUserCart } from '$lib/server/cart';
import { cartItemQuantitySchema } from '$lib/shared/schemas';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    return json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } }, { status: 401 });
  }

  const itemId = params.id;
  if (!itemId) {
    return json({ error: { code: 'VALIDATION_FAILED', message: 'Cart item ID is required.' } }, { status: 422 });
  }

  const body = await request.json().catch(() => ({}));
  const parseResult = cartItemQuantitySchema.safeParse(body);
  if (!parseResult.success) {
    return json(
      { error: { code: 'VALIDATION_FAILED', message: parseResult.error.issues[0]?.message || 'Invalid quantity.' } },
      { status: 422 }
    );
  }

  const item = await db.orm.public.CartItem.where({ id: itemId }).first();
  if (!item || item.userId !== locals.user.id) {
    return json({ error: { code: 'NOT_FOUND', message: 'Cart item not found.' } }, { status: 404 });
  }

  const newQty = parseResult.data.quantity;
  if (newQty <= 0) {
    await db.orm.public.CartItem.where({ id: itemId }).delete();
  } else {
    await db.orm.public.CartItem.where({ id: itemId }).update({ quantity: newQty });
  }

  const cart = await loadUserCart(locals.user.id);
  return json({
    success: true,
    message: newQty <= 0 ? 'Item removed from cart' : 'Quantity updated',
    ...cart
  });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } }, { status: 401 });
  }

  const itemId = params.id;
  if (!itemId) {
    return json({ error: { code: 'VALIDATION_FAILED', message: 'Cart item ID is required.' } }, { status: 422 });
  }

  const item = await db.orm.public.CartItem.where({ id: itemId }).first();

  if (!item || item.userId !== locals.user.id) {
    return json({ error: { code: 'NOT_FOUND', message: 'Cart item not found.' } }, { status: 404 });
  }

  await db.orm.public.CartItem.where({ id: itemId }).delete();

  const cart = await loadUserCart(locals.user.id);
  return json({
    success: true,
    message: 'Item removed from cart.',
    ...cart
  });
};
