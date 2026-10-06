import { redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import type { AdminProductDto, CategoryDto } from '$lib/shared/types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, '/login?next=/admin/catalog');
  }
  if (locals.user.role !== 'ADMIN') {
    throw redirect(303, '/');
  }

  const [products, categories] = await Promise.all([
    db.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    }),
    db.category.findMany({
      orderBy: { sortOrder: 'asc' }
    })
  ]);

  const mappedProducts: AdminProductDto[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    priceIdr: p.priceIdr,
    imageUrl: p.imageUrl,
    kind: p.kind,
    status: p.status,
    isFeatured: p.isFeatured,
    featuredRank: p.featuredRank,
    updatedAt: p.updatedAt.toISOString(),
    category: {
      id: p.category.id,
      slug: p.category.slug,
      name: p.category.name,
      sortOrder: p.category.sortOrder
    }
  }));

  const mappedCategories: CategoryDto[] = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    sortOrder: c.sortOrder
  }));

  return {
    products: mappedProducts,
    categories: mappedCategories
  };
};

export const actions: Actions = {
  toggleStatus: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'ADMIN') {
      return fail(403, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const productId = String(formData.get('productId') || '');
    const currentStatus = String(formData.get('status') || '');

    if (!productId) {
      return fail(400, { message: 'Product ID is required.' });
    }

    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    await db.product.update({
      where: { id: productId },
      data: { status: nextStatus }
    });

    return { success: true };
  }
};
