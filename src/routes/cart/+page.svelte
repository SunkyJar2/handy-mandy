<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';
  import { formatIdr } from '$lib/shared/pricing';
  import { cartStore } from '$lib/stores/cart.svelte';
  import { computeSelectedCartTotals } from '$lib/shared/cart-selection';
  import { ArrowRight, Minus, Plus, Trash2, AlertCircle } from 'lucide-svelte';

  interface Props {
    data: PageData;
    form?: ActionData;
  }

  let { data, form }: Props = $props();

  // Reactive selection set: default all available items to selected
  let selectedIds = $state<Set<string>>(new Set());

  $effect(() => {
    // Sync newly loaded available items
    const availableItemIds = data.items.filter((i) => i.available).map((i) => i.id);
    if (selectedIds.size === 0 && availableItemIds.length > 0) {
      selectedIds = new Set(availableItemIds);
    } else {
      // Clean up removed IDs
      const currentIds = new Set(data.items.map((i) => i.id));
      const nextSet = new Set<string>();
      for (const id of selectedIds) {
        if (currentIds.has(id)) nextSet.add(id);
      }
      selectedIds = nextSet;
    }
  });

  let totals = $derived(computeSelectedCartTotals(data.items, selectedIds));

  let isAllSelected = $derived(
    data.items.length > 0 &&
      data.items.filter((i) => i.available).length > 0 &&
      data.items.filter((i) => i.available).every((i) => selectedIds.has(i.id))
  );

  function toggleSelectAll() {
    if (isAllSelected) {
      selectedIds = new Set();
    } else {
      selectedIds = new Set(data.items.filter((i) => i.available).map((i) => i.id));
    }
  }

  function toggleRow(id: string, available: boolean) {
    if (!available) return;
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    selectedIds = next;
  }
</script>

<svelte:head>
  <title>Cart — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
  <!-- Page Header matching Figma #129:125 / #82:97 / #82:98 -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="font-['Outfit'] font-bold text-3xl sm:text-[40px] text-[#CFF2FF] leading-tight">
        Cart
      </h1>
      <p class="font-['Outfit'] text-sm sm:text-base text-[#CFF2FF]/80 mt-1">
        Review your items and proceed to checkout.
      </p>
    </div>
    <a
      href="/catalog"
      class="inline-flex items-center justify-center h-[42px] px-6 rounded-[15px] font-['Outfit'] font-medium text-base text-white hover:brightness-110 transition-all shadow-md shrink-0 active:scale-95"
      style="background: #4A6FA5;"
    >
      + Continue Shopping
    </a>
  </div>

  {#if form?.message}
    <div class="p-4 rounded-2xl bg-[#FF6D6F]/10 border border-[#FF6D6F]/40 text-[#FF6D6F] text-sm font-medium">
      {form.message}
    </div>
  {/if}

  {#if data.items.length === 0}
    <!-- Empty Cart State matching Figma #44:76 -->
    <div
      class="w-full rounded-[30px] sm:rounded-[40px] p-10 sm:p-20 text-center flex flex-col items-center justify-center border border-[#1A3551] shadow-2xl backdrop-blur-md"
      style="background: rgba(26, 53, 81, 0.5);"
    >
      <div
        class="w-20 h-20 rounded-full border-2 border-[#CFF2FF]/40 flex items-center justify-center text-4xl font-bold text-[#CFF2FF] mb-6 shadow-inner"
        style="background: rgba(74, 111, 165, 0.2);"
      >
        ?
      </div>

      <h2 class="font-['Outfit'] font-bold text-2xl sm:text-3xl text-[#CFF2FF] mb-3">
        No products found
      </h2>
      <p class="font-['Outfit'] text-sm sm:text-base text-[#CFF2FF]/80 max-w-md mb-8">
        You haven’t added any smart home devices to your cart yet.
      </p>

      <a
        href="/catalog"
        class="inline-flex items-center justify-center h-[48px] px-8 rounded-[15px] font-['Outfit'] font-semibold text-lg text-white hover:brightness-110 transition-all shadow-lg hover:scale-105 active:scale-95"
        style="background: #4A6FA5;"
      >
        Browse Smart Home Catalog
      </a>
    </div>
  {:else}
    <!-- Populated 6-Column Cart Table matching Figma #82:72 (Cart 2) -->
    <div
      class="w-full rounded-[30px] sm:rounded-[40px] border border-[#1A3551] overflow-hidden shadow-2xl backdrop-blur-md"
      style="background: rgba(26, 53, 81, 0.5);"
    >
      <!-- Table Header (6 Columns matching Figma 82:127..135 + 267:642 + checkbox 267:661) -->
      <div
        class="hidden md:grid grid-cols-12 gap-4 items-center px-8 py-4.5 border-b border-[#CFF2FF]/15 text-sm sm:text-base font-['Outfit'] font-medium text-white/85"
      >
        <div class="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            onchange={toggleSelectAll}
            class="w-4 h-4 rounded border-[#B6C4D3] text-[#4A6FA5] focus:ring-[#00FBFF] focus:ring-offset-0 bg-[#071824]/60 cursor-pointer"
            aria-label="Select all items"
          />
        </div>
        <div class="col-span-4">Product</div>
        <div class="col-span-2 text-left">Unit Price</div>
        <div class="col-span-2 text-center">Quantity</div>
        <div class="col-span-2 text-left">Total Price</div>
        <div class="col-span-1 text-right">Action</div>
      </div>

      <!-- Rows matching Figma #93:273..307 (Individual gradient row cards) -->
      <div class="p-4 sm:p-6 space-y-3.5">
        {#each data.items as item (item.id)}
          {@const isChecked = selectedIds.has(item.id)}
          <div
            class="rounded-[16px] border border-[#CFF2FF]/25 p-4 sm:px-6 sm:py-3.5 transition-all {
              item.available ? 'hover:border-[#CFF2FF]/45' : 'opacity-55'
            } {isChecked ? 'ring-1 ring-[#00FBFF]/30' : ''}"
            style="background: linear-gradient(90deg, rgba(74, 111, 165, 0.42) 0%, rgba(28, 42, 63, 0.32) 100%);"
          >
            <!-- Desktop 12-col Grid / Mobile Stack -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <!-- Checkbox (Col 1) -->
              <div class="flex items-center gap-3 md:col-span-1">
                <input
                  type="checkbox"
                  disabled={!item.available}
                  checked={isChecked}
                  onchange={() => toggleRow(item.id, item.available)}
                  class="w-4 h-4 rounded border-[#B6C4D3] text-[#4A6FA5] focus:ring-[#00FBFF] focus:ring-offset-0 bg-[#071824]/60 cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Select {item.product.name}"
                />
                <span class="md:hidden text-xs text-[#8CAAB5] uppercase font-bold">Select item</span>
              </div>

              <!-- Product Info (Col 2–5 matching Figma #82:95 + #82:117 + #82:105) -->
              <div class="md:col-span-4 flex items-center gap-3.5 min-w-0">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  class="w-16 h-12 sm:w-[85px] sm:h-[57px] object-cover rounded-lg border border-[#CFF2FF]/25 bg-[#071824] shrink-0"
                />
                <div class="min-w-0 space-y-0.5">
                  <div class="font-['Outfit'] font-medium text-base sm:text-xl text-[#CFF2FF] truncate" title={item.product.name}>
                    {item.product.name}
                  </div>
                  <div class="font-['Outfit'] text-xs sm:text-sm text-[#75929C] line-clamp-1">
                    {item.product.description}
                  </div>
                  {#if !item.available}
                    <span class="inline-flex items-center gap-1 text-xs text-[#FF6D6F] font-semibold mt-1">
                      <AlertCircle class="w-3.5 h-3.5" /> No longer available
                    </span>
                  {/if}
                </div>
              </div>

              <!-- Unit Price (Col 6–7 matching Figma #82:94) -->
              <div class="md:col-span-2 flex md:block items-center justify-between text-sm sm:text-base font-['Outfit'] font-medium text-white/85 tabular-nums">
                <span class="md:hidden text-xs text-[#8CAAB5] uppercase">Unit Price:</span>
                <span>{formatIdr(item.product.priceIdr)}</span>
              </div>

              <!-- Quantity Stepper (Col 8–9 matching Figma #267:583: 84x38, border 2px, radius 8px) -->
              <div class="md:col-span-2 flex items-center justify-between md:justify-center">
                <span class="md:hidden text-xs text-[#8CAAB5] uppercase font-bold">Quantity:</span>
                <div
                  class="w-[84px] h-[38px] px-1 rounded-[8px] border-2 border-[#CFF2FF]/30 bg-[#071824]/40 flex items-center justify-between"
                >
                  <button
                    type="button"
                    onclick={() => cartStore.setQuantity(item.id, item.quantity - 1)}
                    class="w-6 h-6 flex items-center justify-center text-[#CFF2FF] hover:text-white transition-colors"
                    aria-label="Decrease quantity"
                  >
                    {#if item.quantity === 1}
                      <Trash2 class="w-3.5 h-3.5 text-[#FF6D6F]" />
                    {:else}
                      <Minus class="w-3.5 h-3.5" />
                    {/if}
                  </button>

                  <span class="font-['Outfit'] text-sm sm:text-base font-semibold text-white tabular-nums">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onclick={() => cartStore.setQuantity(item.id, Math.min(99, item.quantity + 1))}
                    class="w-6 h-6 flex items-center justify-center text-[#CFF2FF] hover:text-white transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Total Price (Col 10–11 matching Figma #267:636: #00FBFF cyan!) -->
              <div class="md:col-span-2 flex md:block items-center justify-between font-['Outfit'] font-medium text-base sm:text-lg text-[#00FBFF] tabular-nums">
                <span class="md:hidden text-xs text-[#8CAAB5] uppercase">Total:</span>
                <span>{formatIdr(item.product.priceIdr * item.quantity)}</span>
              </div>

              <!-- Action Link (Col 12 matching Figma #267:644: underlined Delete) -->
              <div class="md:col-span-1 flex md:justify-end items-center justify-between pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                <button
                  type="button"
                  onclick={() => cartStore.removeItem(item.id)}
                  class="font-['Outfit'] text-sm sm:text-base font-medium text-white/85 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Cart Bottom Bar matching Figma #267:672..678 -->
      <div
        class="px-6 sm:px-8 py-5 sm:py-6 border-t border-[#CFF2FF]/15 bg-[#071824]/45 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-5 sm:gap-8"
      >
        <div class="flex items-baseline justify-between sm:justify-end gap-3 font-['Outfit']">
          <span class="text-sm sm:text-base font-medium text-white">
            Total ({totals.selectedUnitCount} {totals.selectedUnitCount === 1 ? 'Item' : 'Items'}):
          </span>
          <span class="text-2xl sm:text-3xl font-semibold text-[#00FBFF] tabular-nums">
            {formatIdr(totals.subtotalIdr)}
          </span>
        </div>

        <form method="POST" action="?/proceedCheckout" use:enhance class="shrink-0">
          {#each [...selectedIds] as id}
            <input type="hidden" name="selectedItemId" value={id} />
          {/each}

          <button
            type="submit"
            disabled={totals.selectedLineCount === 0}
            class="w-full sm:w-[255px] h-[44px] sm:h-[48px] rounded-[10px] sm:rounded-[12px] font-['Outfit'] font-medium text-lg sm:text-xl text-[#CFF2FF] hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl flex items-center justify-center gap-2"
            style="background: #4A6FA5;"
          >
            <span>Check Out</span>
            <ArrowRight class="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  {/if}
</div>
