import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    return json({ error: { code: 'FORBIDDEN', message: 'Admin access required.' } }, { status: 403 });
  }

  const productId = params.id;
  const body = await request.json().catch(() => ({}));

  const existing = await db.orm.public.Product.where({ id: productId }).first();

  if (!existing) {
    return json({ error: { code: 'NOT_FOUND', message: 'Product not found.' } }, { status: 404 });
  }

  const updateData: Record<string, any> = {};
  if (body.status) updateData.status = body.status;
  if (body.name) updateData.name = body.name;
  if (body.description) updateData.description = body.description;
  if (body.priceIdr) updateData.priceIdr = Number(body.priceIdr);
  if (body.categoryId) updateData.categoryId = body.categoryId;
  if (body.imageUrl) updateData.imageUrl = body.imageUrl;
  if (typeof body.isFeatured === 'boolean') updateData.isFeatured = body.isFeatured;

  const updated = await db.orm.public.Product.where({ id: productId }).update(updateData);

  return json({ success: true, product: updated });
};
