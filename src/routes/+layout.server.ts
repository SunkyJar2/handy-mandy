import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ locals }) => {
  let cartCount = 0;

  if (locals.user) {
    try {
      const agg = await db.orm.public.CartItem.where({ userId: locals.user.id })
        .aggregate((a) => ({ count: a.count() }));
      cartCount = Number(agg.count ?? 0);
    } catch {
      cartCount = 0;
    }
  }

  return {
    user: locals.user,
    cartCount
  };
};
