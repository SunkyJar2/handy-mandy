import type { CartItemDto, CartResponse, ProductDto } from '$lib/shared/types';
import { toast } from '$lib/stores/toast.svelte';
import { invalidateAll } from '$app/navigation';

class CartStore {
  items = $state<CartItemDto[]>([]);
  subtotalIdr = $state<number>(0);
  itemCount = $state<number>(0);
  isOpen = $state<boolean>(false);
  anchor = $state<'nav' | 'fab'>('fab');
  pendingProductIds = $state<Set<string>>(new Set());
  isMutating = $state<boolean>(false);

  hydrate(cart: CartResponse | undefined | null) {
    if (this.isMutating || !cart) return;
    this.items = cart.items ?? [];
    this.subtotalIdr = cart.subtotalIdr ?? 0;
    this.itemCount = cart.itemCount ?? 0;
  }

  open(anchor: 'nav' | 'fab' = 'fab') {
    this.anchor = anchor;
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  toggle(anchor: 'nav' | 'fab' = 'fab') {
    if (this.isOpen && this.anchor === anchor) {
      this.close();
    } else {
      this.open(anchor);
    }
  }

  getProductQuantity(productId: string): number {
    const found = this.items.find((i) => i.productId === productId);
    return found ? found.quantity : 0;
  }

  async addProduct(product: ProductDto, isAuthenticated: boolean) {
    if (!isAuthenticated) {
      try {
        sessionStorage.setItem('pendingCartProduct', JSON.stringify(product));
      } catch {}
      const target = window.location.pathname + window.location.search;
      window.location.href = `/login?next=${encodeURIComponent(target)}`;
      return;
    }

    if (this.pendingProductIds.has(product.id)) return;

    const prevItems = [...this.items];
    const prevSubtotal = this.subtotalIdr;
    const prevCount = this.itemCount;

    // Optimistic update
    this.pendingProductIds.add(product.id);
    const existing = this.items.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + 1);
    } else {
      this.items.unshift({
        id: `temp-${Date.now()}`,
        productId: product.id,
        quantity: 1,
        available: true,
        product
      });
    }
    this.subtotalIdr += product.priceIdr;
    this.itemCount += 1;

    try {
      this.isMutating = true;
      const res = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.items) {
          this.items = data.items;
          this.subtotalIdr = data.subtotalIdr;
          this.itemCount = data.itemCount;
        }
        toast.show(`Added ${product.name} to cart!`, 'success');
        await invalidateAll();
      } else {
        // Rollback
        this.items = prevItems;
        this.subtotalIdr = prevSubtotal;
        this.itemCount = prevCount;
        toast.show(data.error?.message || 'Could not add item to cart.', 'error');
      }
    } catch {
      this.items = prevItems;
      this.subtotalIdr = prevSubtotal;
      this.itemCount = prevCount;
      toast.show('Network error adding to cart.', 'error');
    } finally {
      this.pendingProductIds.delete(product.id);
      this.isMutating = false;
    }
  }

  async setQuantity(itemId: string, nextQty: number) {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return;

    if (nextQty <= 0) {
      return this.removeItem(itemId);
    }

    const prevQty = item.quantity;
    const diff = nextQty - prevQty;
    const price = item.product.priceIdr;

    // Optimistic update
    item.quantity = nextQty;
    this.subtotalIdr += price * diff;
    this.itemCount += diff;

    try {
      this.isMutating = true;
      const res = await fetch(`/api/v1/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: nextQty })
      });
      const data = await res.json();
      if (res.ok && data.items) {
        this.items = data.items;
        this.subtotalIdr = data.subtotalIdr;
        this.itemCount = data.itemCount;
        await invalidateAll();
      } else {
        item.quantity = prevQty;
        this.subtotalIdr -= price * diff;
        this.itemCount -= diff;
        toast.show(data.error?.message || 'Could not update quantity.', 'error');
      }
    } catch {
      item.quantity = prevQty;
      this.subtotalIdr -= price * diff;
      this.itemCount -= diff;
      toast.show('Network error updating quantity.', 'error');
    } finally {
      this.isMutating = false;
    }
  }

  async removeItem(itemId: string) {
    const itemIndex = this.items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;

    const removed = this.items[itemIndex];
    const prevItems = [...this.items];
    const prevSubtotal = this.subtotalIdr;
    const prevCount = this.itemCount;

    // Optimistic removal
    this.items.splice(itemIndex, 1);
    this.subtotalIdr -= removed.product.priceIdr * removed.quantity;
    this.itemCount -= removed.quantity;

    try {
      this.isMutating = true;
      const res = await fetch(`/api/v1/cart/items/${itemId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.items) {
        this.items = data.items;
        this.subtotalIdr = data.subtotalIdr;
        this.itemCount = data.itemCount;
        toast.show('Item removed from cart', 'info');
        await invalidateAll();
      } else {
        this.items = prevItems;
        this.subtotalIdr = prevSubtotal;
        this.itemCount = prevCount;
        toast.show(data.error?.message || 'Could not remove item.', 'error');
      }
    } catch {
      this.items = prevItems;
      this.subtotalIdr = prevSubtotal;
      this.itemCount = prevCount;
      toast.show('Network error removing item.', 'error');
    } finally {
      this.isMutating = false;
    }
  }
}

export const cartStore = new CartStore();

