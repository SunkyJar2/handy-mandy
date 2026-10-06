import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import type { ProductDto, CategoryDto } from '$lib/shared/types';

export const load: PageServerLoad = async ({ locals }) => {
  const [featuredProducts, categories] = await Promise.all([
    db.product.findMany({
      where: { status: 'ACTIVE', isFeatured: true },
      include: { category: true },
      orderBy: [{ featuredRank: 'asc' }, { createdAt: 'desc' }],
      take: 8
    }),
    db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          include: { category: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  ]);

  const mapProduct = (p: (typeof featuredProducts)[0]): ProductDto => ({
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
  });

  const sections = categories.map((cat) => ({
    category: {
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      sortOrder: cat.sortOrder
    },
    products: cat.products.map(mapProduct)
  }));

  return {
    featured: featuredProducts.map(mapProduct),
    sections,
    user: locals.user
  };
};
