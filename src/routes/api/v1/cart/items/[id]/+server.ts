import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } }, { status: 401 });
  }

  const itemId = params.id;
  if (!itemId) {
    return json({ error: { code: 'VALIDATION_FAILED', message: 'Cart item ID is required.' } }, { status: 422 });
  }

  // Ensure item belongs to user
  const item = await db.orm.public.CartItem.where({ id: itemId }).first();

  if (!item || item.userId !== locals.user.id) {
    return json({ error: { code: 'NOT_FOUND', message: 'Cart item not found.' } }, { status: 404 });
  }

  await db.orm.public.CartItem.where({ id: itemId }).delete();

  return json({ success: true, message: 'Item removed from cart.' });
};
