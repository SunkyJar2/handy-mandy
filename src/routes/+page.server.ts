import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import type { ProductDto } from '$lib/shared/types';

export const load: PageServerLoad = async ({ locals }) => {
  try {
    const [featuredProducts, categories] = await Promise.all([
      db.orm.public.Product
        .where({ status: 'ACTIVE', isFeatured: true })
        .include('category')
        .orderBy((p) => p.featuredRank.asc())
        .limit(8)
        .all(),
      db.orm.public.Category
        .orderBy((c) => c.sortOrder.asc())
        .include('products', (prods) =>
          prods.where({ status: 'ACTIVE' }).include('category')
        )
        .all()
    ]);

    const mapProduct = (p: (typeof featuredProducts)[0]): ProductDto => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      priceIdr: p.priceIdr,
      imageUrl: p.imageUrl,
      kind: p.kind as any,
      status: p.status as any,
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
      user: locals.user,
      dbConnected: true
    };
  } catch (err) {
    console.error('[load:homepage] Failed to load products from database:', err);
    return {
      featured: [],
      sections: [],
      user: locals.user,
      dbConnected: false
    };
  }
};
