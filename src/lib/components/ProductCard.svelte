<script lang="ts">
  import type { ProductDto, UserDto } from '$lib/shared/types';
  import { formatIdr } from '$lib/shared/pricing';
  import { toast } from '$lib/stores/toast.svelte';
  import { Check, ShoppingCart, Loader2 } from 'lucide-svelte';
  import { invalidateAll } from '$app/navigation';

  interface Props {
    product: ProductDto;
    user: UserDto | null;
  }

  let { product, user }: Props = $props();
  let isAdding = $state(false);
  let isAdded = $state(false);

  async function handleAdd() {
    if (!user) {
      // Store in sessionStorage and redirect to login
      try {
        sessionStorage.setItem('pendingCartProduct', JSON.stringify(product));
      } catch {}
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (isAdding || isAdded) return;
    isAdding = true;

    try {
      const res = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      });

      const data = await res.json();

      if (res.ok) {
        isAdded = true;
        toast.show(`Added ${product.name} to cart!`, 'success');
        await invalidateAll();
        setTimeout(() => {
          isAdded = false;
        }, 1800);
      } else if (res.status === 409) {
        toast.show(data.error?.message || 'Already in your cart.', 'info');
      } else {
        toast.show(data.error?.message || 'Could not add item to cart.', 'error');
      }
    } catch {
      toast.show('Network error adding to cart.', 'error');
    } finally {
      isAdding = false;
    }
  }
</script>

<!-- Product Card matching Figma frame 93:76: 336x349px -->
<div
  class="group relative flex-none w-[310px] sm:w-[336px] h-[350px] rounded-[12px] p-0 flex flex-col justify-between overflow-hidden border border-[#CFF2FF]/10 transition-all duration-300 hover:border-[#CFF2FF]/30 hover:shadow-2xl hover:-translate-y-1"
  style="background: rgba(74, 111, 165, 0.26); box-shadow: 0px 2px 2.8px 0px rgba(0, 0, 0, 0.25);"
>
  <!-- Image container (336x228) -->
  <div class="relative w-full h-[228px] overflow-hidden rounded-t-[12px] bg-[#071824]/80">
    <img
      src={product.imageUrl}
      alt={product.name}
      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
    />
    {#if product.isFeatured}
      <span
        class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-[#4A6FA5]/90 text-white backdrop-blur-md shadow-md"
      >
        Featured
      </span>
    {/if}
  </div>

  <!-- Bottom info (Figma frame coordinates and styling) -->
  <div class="p-3.5 flex-1 flex flex-col justify-between">
    <!-- Title -->
    <h3
      class="font-['Outfit'] font-normal text-lg sm:text-[20px] leading-[1.25em] text-[#CFF2FF] line-clamp-1 group-hover:text-white transition-colors"
      title={product.name}
    >
      {product.name}
    </h3>

    <!-- Price and Add Button row -->
    <div class="flex items-center justify-between mt-2 pt-1">
      <div class="font-['Outfit'] font-bold text-lg sm:text-[20px] text-[#25ED82] leading-none">
        {formatIdr(product.priceIdr)}
      </div>

      <!-- Add Button (Figma 29:d9d503: 117x45 border 2px #CFF2FF at 30% alpha) -->
      <button
        onclick={handleAdd}
        disabled={isAdding}
        class="h-10 px-4 rounded-[8px] border-2 border-[#CFF2FF]/40 text-[#CFF2FF] hover:bg-[#CFF2FF]/15 hover:border-[#CFF2FF] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60"
        aria-label="Add {product.name} to cart"
      >
        {#if isAdding}
          <Loader2 class="w-4 h-4 animate-spin text-[#CFF2FF]" />
        {:else if isAdded}
          <Check class="w-4 h-4 text-[#25ED82]" />
          <span class="font-['Outfit'] text-base font-medium text-[#25ED82]">Added</span>
        {:else}
          <span class="font-['Outfit'] text-lg font-normal">Add</span>
          <ShoppingCart class="w-4 h-4 text-[#CFF2FF]/90" />
        {/if}
      </button>
    </div>
  </div>
</div>
