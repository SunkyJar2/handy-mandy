import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import type { ProductDto, CategoryDto } from '$lib/shared/types';

export const load: PageServerLoad = async ({ url, locals }) => {
  const selectedCategory = url.searchParams.get('category');

  const [categories, products] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.product.findMany({
      where: {
        status: 'ACTIVE',
        ...(selectedCategory ? { category: { slug: selectedCategory } } : {})
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const mappedProducts: ProductDto[] = products.map((p) => ({
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
    categories: mappedCategories,
    selectedCategory,
    user: locals.user
  };
};
