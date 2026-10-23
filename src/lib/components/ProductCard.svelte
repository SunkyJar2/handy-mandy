<script lang="ts">
  import type { ProductDto, UserDto } from '$lib/shared/types';
  import { formatIdr } from '$lib/shared/pricing';
  import { cartStore } from '$lib/stores/cart.svelte';
  import { Check, Plus, Loader2 } from 'lucide-svelte';

  interface Props {
    product: ProductDto;
    user: UserDto | null;
    class?: string;
  }

  let { product, user, class: className = '' }: Props = $props();

  let isAdding = $derived(cartStore.pendingProductIds.has(product.id));
  let inCartCount = $derived(cartStore.getProductQuantity(product.id));
</script>

<!-- Product Card matching Figma frame 93:76: 336x349px -->
<div
  class="group relative w-full max-w-[340px] h-[350px] rounded-[12px] p-0 flex flex-col justify-between overflow-hidden border border-[#CFF2FF]/10 transition-all duration-300 hover:border-[#CFF2FF]/30 hover:shadow-2xl hover:-translate-y-1 {className}"
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
    <div class="absolute top-3 left-3 flex items-center gap-1.5">
      {#if product.isFeatured}
        <span
          class="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-[#4A6FA5]/90 text-white backdrop-blur-md shadow-md"
        >
          Featured
        </span>
      {/if}
      {#if inCartCount > 0}
        <span
          class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#25ED82] text-[#071824] shadow-md tabular-nums"
        >
          In Cart · {inCartCount}
        </span>
      {/if}
    </div>
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
    <div class="flex items-center justify-between mt-2 pt-1 gap-2">
      <div class="font-['Outfit'] font-bold text-base sm:text-[19px] text-[#25ED82] leading-none shrink-0 tabular-nums">
        {formatIdr(product.priceIdr)}
      </div>

      <!-- Add Button matching Figma #93:497: 117x45 border 2px #CFF2FF at 30% alpha with Plus icon -->
      <button
        type="button"
        onclick={() => cartStore.addProduct(product, Boolean(user))}
        disabled={isAdding}
        class="h-10 px-3.5 sm:px-4 rounded-[8px] border-2 border-[#CFF2FF]/40 text-[#CFF2FF] hover:bg-[#CFF2FF]/15 hover:border-[#CFF2FF] transition-all flex items-center gap-1.5 sm:gap-2 active:scale-95 disabled:opacity-60 shrink-0 font-['Outfit']"
        aria-label="Add {product.name} to cart"
      >
        {#if isAdding}
          <Loader2 class="w-4 h-4 animate-spin text-[#CFF2FF]" />
        {:else if inCartCount > 0}
          <Check class="w-4 h-4 text-[#25ED82]" />
          <span class="text-sm font-medium text-[#25ED82]">Added</span>
        {:else}
          <span class="text-base sm:text-lg font-normal">Add</span>
          <Plus class="w-4 h-4 text-[#CFF2FF]/90 stroke-[2.5]" />
        {/if}
      </button>
    </div>
  </div>
</div>
