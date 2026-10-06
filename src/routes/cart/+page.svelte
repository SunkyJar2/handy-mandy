<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { formatIdr } from '$lib/shared/pricing';
  import { toast } from '$lib/stores/toast.svelte';
  import { ArrowRight, Trash2, AlertCircle, ShoppingBag } from 'lucide-svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let hasUnavailableItems = $derived(data.items.some((i) => !i.available));
</script>

<svelte:head>
  <title>Cart — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1240px] mx-auto px-6 py-10 space-y-8">
  <!-- Page Header (Figma 129:125 / 82:97) -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="font-['Outfit'] font-bold text-3xl sm:text-[40px] text-[#CFF2FF] leading-tight">
        Cart
      </h1>
      <p class="font-['Outfit'] text-base text-[#CFF2FF]/80 mt-1">
        Review your items and proceed to checkout.
      </p>
    </div>
    <a
      href="/catalog"
      class="inline-flex items-center justify-center h-[42px] px-6 rounded-[15px] font-['Outfit'] font-medium text-base text-white hover:brightness-110 transition-all shadow-md shrink-0"
      style="background: #4A6FA5;"
    >
      + Continue Shopping
    </a>
  </div>

  {#if data.items.length === 0}
    <!-- Empty Cart State matching Figma #44:76 -->
    <div
      class="w-full rounded-[40px] p-12 sm:p-20 text-center flex flex-col items-center justify-center border border-[#1A3551] shadow-2xl backdrop-blur-md"
      style="background: rgba(26, 53, 81, 0.5);"
    >
      <!-- Question Mark Icon Circle (Figma 44:129) -->
      <div
        class="w-20 h-20 rounded-full border-2 border-[#CFF2FF]/40 flex items-center justify-center text-4xl font-bold text-[#CFF2FF] mb-6 shadow-inner"
        style="background: rgba(74, 111, 165, 0.2);"
      >
        ?
      </div>

      <h2 class="font-['Outfit'] font-bold text-2xl sm:text-3xl text-[#CFF2FF] mb-3">
        No products found
      </h2>
      <p class="font-['Outfit'] text-base text-[#CFF2FF]/80 max-w-md mb-8">
        You haven’t added any smart home devices to your cart yet.
      </p>

      <a
        href="/catalog"
        class="inline-flex items-center justify-center h-[48px] px-8 rounded-[15px] font-['Outfit'] font-semibold text-lg text-white hover:brightness-110 transition-all shadow-lg hover:scale-105"
        style="background: #4A6FA5;"
      >
        Browse Smart Home Catalog
      </a>
    </div>
  {:else}
    <!-- Populated Cart Table Panel matching Figma #82:72 -->
    <div
      class="w-full rounded-[30px] sm:rounded-[40px] border border-[#1A3551] overflow-hidden shadow-2xl backdrop-blur-md"
      style="background: rgba(26, 53, 81, 0.5);"
    >
      <!-- Table Header -->
      <div class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#CFF2FF]/10 text-sm sm:text-base font-['Outfit'] font-medium text-white/85">
        <div class="col-span-6 sm:col-span-5">Product</div>
        <div class="hidden sm:block sm:col-span-3">Category</div>
        <div class="col-span-3 sm:col-span-2">Price</div>
        <div class="col-span-3 sm:col-span-2 text-right">Action</div>
      </div>

      <!-- Rows -->
      <div class="divide-y divide-[#CFF2FF]/10">
        {#each data.items as item (item.id)}
          <div class="grid grid-cols-12 gap-4 items-center px-6 py-4.5 hover:bg-[#1A3551]/30 transition-colors {item.available ? '' : 'opacity-50'}">
            <!-- Product info -->
            <div class="col-span-6 sm:col-span-5 flex items-center gap-4">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                class="w-16 h-12 sm:w-20 sm:h-14 object-cover rounded-lg border border-[#CFF2FF]/20 bg-[#071824] shrink-0"
              />
              <div class="min-w-0">
                <div class="font-['Outfit'] font-medium text-base sm:text-lg text-white truncate" title={item.product.name}>
                  {item.product.name}
                </div>
                <div class="text-xs text-[#8CAAB5] line-clamp-1">
                  {item.product.description}
                </div>
                {#if !item.available}
                  <span class="inline-flex items-center gap-1 text-xs text-[#FF6D6F] font-semibold mt-1">
                    <AlertCircle class="w-3.5 h-3.5" /> No longer available
                  </span>
                {/if}
              </div>
            </div>

            <!-- Category -->
            <div class="hidden sm:block sm:col-span-3">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#4A6FA5]/40 text-[#CFF2FF] border border-[#CFF2FF]/20">
                {item.product.category.name}
              </span>
            </div>

            <!-- Price -->
            <div class="col-span-3 sm:col-span-2 font-['Outfit'] font-bold text-base sm:text-lg text-[#25ED82]">
              {formatIdr(item.product.priceIdr)}
            </div>

            <!-- Action ("Cancel") -->
            <div class="col-span-3 sm:col-span-2 text-right">
              <form
                method="POST"
                action="?/remove"
                use:enhance={() => {
                  return async ({ result, update }) => {
                    if (result.type === 'success') {
                      toast.show('Item removed from cart', 'info');
                    }
                    await update();
                  };
                }}
              >
                <input type="hidden" name="itemId" value={item.id} />
                <button
                  type="submit"
                  class="font-['Outfit'] text-sm sm:text-base font-medium text-[#FF6D6F] hover:text-[#ff8a8c] hover:underline transition-colors p-1"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        {/each}
      </div>

      <!-- Cart Footer: Total + Proceed to Checkout -->
      <div class="p-6 sm:p-8 border-t border-[#CFF2FF]/15 bg-[#071824]/40 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div class="text-xs sm:text-sm text-[#8CAAB5] font-['Outfit'] uppercase tracking-wider font-semibold">
            Cart Subtotal ({data.itemCount} items)
          </div>
          <div class="font-['Outfit'] font-extrabold text-2xl sm:text-4xl text-[#CFF2FF] mt-1">
            {formatIdr(data.subtotalIdr)}
          </div>
        </div>

        <div>
          {#if hasUnavailableItems}
            <div class="text-sm text-[#FF6D6F] text-right mb-2 font-medium">
              Remove unavailable items before proceeding.
            </div>
          {/if}
          <a
            href={hasUnavailableItems ? '#' : '/checkout/location'}
            class="inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-[15px] font-['Outfit'] font-semibold text-lg text-white transition-all shadow-xl {
              hasUnavailableItems
                ? 'opacity-50 cursor-not-allowed bg-gray-600'
                : 'bg-[#4A6FA5] hover:bg-[#5b84c0] hover:scale-[1.02] active:scale-[0.99]'
            }"
          >
            <span>Proceed to checkout</span>
            <ArrowRight class="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  {/if}
</div>
