import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import type { ProductDto, CategoryDto } from '$lib/shared/types';

export const load: PageServerLoad = async ({ url, locals }) => {
  const selectedCategory = url.searchParams.get('category');

  try {
    const categories = await db.orm.public.Category.orderBy((c) => c.sortOrder.asc()).all();

    let categoryId: string | undefined;
    if (selectedCategory) {
      const foundCat = categories.find((c) => c.slug === selectedCategory);
      if (foundCat) {
        categoryId = foundCat.id;
      }
    }

    let productQuery = db.orm.public.Product.where({ status: 'ACTIVE' });
    if (categoryId) {
      productQuery = productQuery.where({ categoryId });
    }

    const products = await productQuery
      .include('category')
      .orderBy((p) => p.createdAt.desc())
      .all();

    const mappedProducts: ProductDto[] = products.map((p) => ({
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
      user: locals.user,
      dbConnected: true
    };
  } catch (err) {
    console.error('[load:catalog] Failed to load catalog from database:', err);
    return {
      products: [],
      categories: [],
      selectedCategory,
      user: locals.user,
      dbConnected: false
    };
  }
};
