import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { loadUserCart } from '$lib/server/cart';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } }, { status: 401 });
  }

  const cart = await loadUserCart(locals.user.id);
  return json(cart);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const productId = String(body.productId || '');

  if (!productId) {
    return json({ error: { code: 'VALIDATION_FAILED', message: 'Product ID is required.' } }, { status: 422 });
  }

  // Check product existence and status
  const product = await db.orm.public.Product.where({ id: productId }).first();

  if (!product) {
    return json({ error: { code: 'NOT_FOUND', message: 'Product not found.' } }, { status: 404 });
  }

  if (product.status !== 'ACTIVE') {
    return json({ error: { code: 'PRODUCT_INACTIVE', message: 'This product is no longer available.' } }, { status: 409 });
  }

  // Check duplicate -> increment quantity instead of 409 error
  const existing = await db.orm.public.CartItem.where({
    userId: locals.user.id,
    productId
  }).first();

  if (existing) {
    const nextQty = Math.min(99, existing.quantity + 1);
    await db.orm.public.CartItem.where({ id: existing.id }).update({
      quantity: nextQty
    });

    const cart = await loadUserCart(locals.user.id);
    return json(
      {
        success: true,
        message: 'Updated quantity in cart',
        ...cart
      },
      { status: 200 }
    );
  }

  await db.orm.public.CartItem.create({
    userId: locals.user.id,
    productId,
    quantity: 1
  });

  const cart = await loadUserCart(locals.user.id);
  return json(
    {
      success: true,
      message: 'Added to cart',
      ...cart
    },
    { status: 201 }
  );
};
