import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { CartItemDto } from '$lib/shared/types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return {
      items: [],
      subtotalIdr: 0,
      itemCount: 0
    };
  }

  const cartRecords = await db.orm.public.CartItem
    .where({ userId: locals.user.id })
    .include('product', (p) => p.include('category'))
    .orderBy((c) => c.addedAt.desc())
    .all();

  let subtotalIdr = 0;
  let itemCount = 0;

  const items: CartItemDto[] = [];
  for (const item of cartRecords) {
    if (!item.product) continue;
    const isAvailable = item.product.status === 'ACTIVE';
    if (isAvailable) {
      subtotalIdr += item.product.priceIdr * item.quantity;
      itemCount += item.quantity;
    }

    items.push({
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

  return {
    items,
    subtotalIdr,
    itemCount
  };
};

export const actions: Actions = {
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
