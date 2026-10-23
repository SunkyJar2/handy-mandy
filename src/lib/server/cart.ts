import { db } from '$lib/server/db';
import type { CartItemDto, CartResponse } from '$lib/shared/types';

export async function loadUserCart(userId: string): Promise<CartResponse> {
  const items = await db.orm.public.CartItem
    .where({ userId })
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

  return { items: mappedItems, subtotalIdr, itemCount };
}

