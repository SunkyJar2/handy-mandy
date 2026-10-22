import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { adminProductPatchSchema } from '$lib/shared/schemas';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    return json({ error: { code: 'FORBIDDEN', message: 'Admin access required.' } }, { status: 403 });
  }

  const productId = params.id;
  const rawBody = await request.json().catch(() => ({}));

  const parseResult = adminProductPatchSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return json({
      error: {
        code: 'VALIDATION_ERROR',
        message: parseResult.error.issues[0]?.message || 'Invalid product data.',
        issues: parseResult.error.issues
      }
    }, { status: 422 });
  }

  const existing = await db.orm.public.Product.where({ id: productId }).first();
  if (!existing) {
    return json({ error: { code: 'NOT_FOUND', message: 'Product not found.' } }, { status: 404 });
  }

  const data = parseResult.data;

  if (data.categoryId) {
    const cat = await db.orm.public.Category.where({ id: data.categoryId }).first();
    if (!cat) {
      return json({ error: { code: 'BAD_REQUEST', message: 'Category not found.' } }, { status: 400 });
    }
  }

  const updateData: Record<string, any> = {
    ...data,
    updatedAt: Temporal.Instant.fromEpochMilliseconds(Date.now())
  };

  const updated = await db.orm.public.Product.where({ id: productId }).update(updateData);

  return json({ success: true, product: updated });
};
