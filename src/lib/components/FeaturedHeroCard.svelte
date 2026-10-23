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

<!-- Giant Featured Hero Card matching Figma #196:86 (724x752px) -->
<article
  class="group relative w-full h-full min-h-[520px] lg:min-h-[720px] rounded-[14px] p-0 flex flex-col justify-between overflow-hidden border border-[#CFF2FF]/15 transition-all duration-300 hover:border-[#CFF2FF]/35 hover:shadow-2xl {className}"
  style="background: rgba(74, 111, 165, 0.26); box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.35);"
>
  <!-- Top Image Container matching Figma #93:83: 724x491 -->
  <div class="relative w-full h-[320px] sm:h-[420px] lg:h-[480px] overflow-hidden rounded-t-[14px] bg-[#071824]">
    <img
      src={product.imageUrl}
      alt={product.name}
      class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      loading="eager"
    />

    <div class="absolute top-4 left-4 flex items-center gap-2">
      <span
        class="px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold tracking-wide bg-[#4A6FA5]/90 text-white backdrop-blur-md shadow-md"
      >
        Featured Hardware
      </span>
      {#if inCartCount > 0}
        <span
          class="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-[#25ED82] text-[#071824] shadow-md tabular-nums"
        >
          In Cart · {inCartCount}
        </span>
      {/if}
    </div>
  </div>

  <!-- Bottom Details matching Figma #93:79, #93:80, #93:81 -->
  <div class="p-6 sm:p-8 lg:p-10 flex-1 flex flex-col justify-between gap-6">
    <div class="space-y-2">
      <h3
        class="font-['Outfit'] font-normal text-2xl sm:text-4xl lg:text-[44px] leading-[1.15em] text-[#CFF2FF] group-hover:text-white transition-colors"
      >
        {product.name}
      </h3>
      <p class="font-['Outfit'] text-sm sm:text-base text-[#CFF2FF]/70 line-clamp-2 max-w-xl">
        {product.description}
      </p>
    </div>

    <!-- Price and Oversized Add to Cart Button row -->
    <div class="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#CFF2FF]/10">
      <div class="font-['Outfit'] font-bold text-2xl sm:text-3xl lg:text-[34px] text-white tabular-nums">
        {formatIdr(product.priceIdr)}
      </div>

      <!-- Add to Cart Button (Figma #93:81 / #93:78: 268x66, border 2px, radius 8px) -->
      <button
        type="button"
        onclick={() => cartStore.addProduct(product, Boolean(user))}
        disabled={isAdding}
        class="h-12 sm:h-14 lg:h-[62px] px-6 sm:px-8 rounded-[8px] border-2 border-[#CFF2FF]/40 text-[#CFF2FF] hover:bg-[#CFF2FF]/15 hover:border-[#CFF2FF] hover:text-white transition-all flex items-center gap-3 active:scale-95 disabled:opacity-60 shadow-md font-['Outfit'] text-lg sm:text-xl lg:text-[22px] font-normal"
        aria-label="Add {product.name} to cart"
      >
        {#if isAdding}
          <Loader2 class="w-5 h-5 animate-spin text-[#CFF2FF]" />
          <span>Adding...</span>
        {:else if inCartCount > 0}
          <Check class="w-5 h-5 text-[#25ED82]" />
          <span class="text-[#25ED82]">Added ({inCartCount})</span>
        {:else}
          <span>Add to Cart</span>
          <Plus class="w-5 h-5 stroke-[2.5]" />
        {/if}
      </button>
    </div>
  </div>
</article>

