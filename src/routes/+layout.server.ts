import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ locals }) => {
  let cartCount = 0;

  if (locals.user) {
    cartCount = await db.cartItem.count({
      where: { userId: locals.user.id }
    });
  }

  return {
    user: locals.user,
    cartCount
  };
};
