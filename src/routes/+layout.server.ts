import type { LayoutServerLoad } from './$types';
import { loadUserCart } from '$lib/server/cart';
import type { CartResponse } from '$lib/shared/types';

export const load: LayoutServerLoad = async ({ locals }) => {
  let cart: CartResponse = {
    items: [],
    subtotalIdr: 0,
    itemCount: 0
  };

  if (locals.user) {
    try {
      cart = await loadUserCart(locals.user.id);
    } catch {
      cart = { items: [], subtotalIdr: 0, itemCount: 0 };
    }
  }

  return {
    user: locals.user,
    cartCount: cart.itemCount,
    cart
  };
};
