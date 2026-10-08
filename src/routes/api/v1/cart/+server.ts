import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { CartResponse, CartItemDto } from '$lib/shared/types';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } }, { status: 401 });
  }

  const items = await db.orm.public.CartItem
    .where({ userId: locals.user.id })
    .include('product', (p) => p.include('category'))
    .orderBy((c) => c.addedAt.desc())
    .all();

  let subtotalIdr = 0;
  let itemCount = 0;

  const mappedItems: CartItemDto[] = [];
  for (const item of items) {
    if (!item.product) continue;
    const isAvailable = item.product.status === 'ACTIVE';
    if (isAvailable) {
      subtotalIdr += item.product.priceIdr * item.quantity;
      itemCount += item.quantity;
    }

    mappedItems.push({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      available: isAvailable,
      product: {
        id: item.product.id,
        slug: item.product.slug,
        name: item.product.name,
        description: item.product.description,
        priceIdr: item.product.priceIdr,
        imageUrl: item.product.imageUrl,
        kind: item.product.kind as any,
        status: item.product.status as any,
        isFeatured: item.product.isFeatured,
        featuredRank: item.product.featuredRank,
        category: {
          id: item.product.category?.id ?? '',
          slug: item.product.category?.slug ?? '',
          name: item.product.category?.name ?? '',
          sortOrder: item.product.category?.sortOrder ?? 0
        }
      }
    });
  }

  const response: CartResponse = {
    items: mappedItems,
    subtotalIdr,
    itemCount
  };

  return json(response);
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

  // Check duplicate
  const existing = await db.orm.public.CartItem.where({
    userId: locals.user.id,
    productId
  }).first();

  if (existing) {
    return json({ error: { code: 'ALREADY_IN_CART', message: 'Already in your cart.' } }, { status: 409 });
  }

  await db.orm.public.CartItem.create({
    userId: locals.user.id,
    productId,
    quantity: 1
  });

  // Return updated cart
  const items = await db.orm.public.CartItem
    .where({ userId: locals.user.id })
    .include('product', (p) => p.include('category'))
    .all();

  let subtotalIdr = 0;
  let itemCount = 0;
  for (const item of items) {
    if (item.product && item.product.status === 'ACTIVE') {
      subtotalIdr += item.product.priceIdr * item.quantity;
      itemCount += item.quantity;
    }
  }

  return json(
    {
      success: true,
      message: 'Added to cart',
      itemCount,
      subtotalIdr
    },
    { status: 201 }
  );
};
