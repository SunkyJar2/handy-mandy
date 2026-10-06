import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { adminProductSchema } from '$lib/shared/schemas';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    return json({ error: { code: 'FORBIDDEN', message: 'Admin access required.' } }, { status: 403 });
  }

  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  return json({ products });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    return json({ error: { code: 'FORBIDDEN', message: 'Admin access required.' } }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parseResult = adminProductSchema.safeParse(body);

  if (!parseResult.success) {
    return json(
      {
        error: {
          code: 'VALIDATION_FAILED',
          message: parseResult.error.issues[0]?.message || 'Invalid product data.'
        }
      },
      { status: 422 }
    );
  }

  // Generate unique slug
  const baseSlug = parseResult.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const product = await db.product.create({
    data: {
      slug,
      name: parseResult.data.name,
      description: parseResult.data.description,
      priceIdr: parseResult.data.priceIdr,
      imageUrl: parseResult.data.imageUrl,
      kind: parseResult.data.kind || 'DEVICE',
      status: 'ACTIVE',
      isFeatured: parseResult.data.isFeatured ?? false,
      categoryId: parseResult.data.categoryId
    }
  });

  return json({ success: true, product }, { status: 201 });
};
