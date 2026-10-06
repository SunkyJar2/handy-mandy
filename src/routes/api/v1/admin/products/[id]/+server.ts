import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    return json({ error: { code: 'FORBIDDEN', message: 'Admin access required.' } }, { status: 403 });
  }

  const productId = params.id;
  const body = await request.json().catch(() => ({}));

  const existing = await db.product.findUnique({
    where: { id: productId }
  });

  if (!existing) {
    return json({ error: { code: 'NOT_FOUND', message: 'Product not found.' } }, { status: 404 });
  }

  const updated = await db.product.update({
    where: { id: productId },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.name ? { name: body.name } : {}),
      ...(body.description ? { description: body.description } : {}),
      ...(body.priceIdr ? { priceIdr: Number(body.priceIdr) } : {}),
      ...(body.categoryId ? { categoryId: body.categoryId } : {}),
      ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}),
      ...(typeof body.isFeatured === 'boolean' ? { isFeatured: body.isFeatured } : {})
    }
  });

  return json({ success: true, product: updated });
};
