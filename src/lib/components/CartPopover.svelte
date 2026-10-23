<script lang="ts">
  import { untrack } from 'svelte';
  import { cartStore } from '$lib/stores/cart.svelte';
  import { formatIdr } from '$lib/shared/pricing';
  import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { page } from '$app/state';

  let popoverEl = $state<HTMLDivElement | null>(null);

  // Close when navigating to /cart or /checkout
  $effect(() => {
    const path = page.url.pathname;
    if (path === '/cart' || path.startsWith('/checkout')) {
      untrack(() => {
        if (cartStore.isOpen) {
          cartStore.close();
        }
      });
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (cartStore.isOpen && e.key === 'Escape') {
      cartStore.close();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (popoverEl && !popoverEl.contains(e.target as Node)) {
      cartStore.close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if cartStore.isOpen}
  <!-- Backdrop scrim for outside click / mobile sheet -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    transition:fade={{ duration: 160 }}
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] sm:bg-black/25"
    onclick={handleBackdropClick}
  ></div>

  <!-- Popover container: Bottom sheet on mobile (< 640px), Floating Glass Popover on Desktop (>= 640px) -->
  <div
    bind:this={popoverEl}
    role="dialog"
    aria-modal="true"
    aria-labelledby="cart-popover-title"
    tabindex="-1"
    transition:fly={{ y: 20, duration: 220, easing: cubicOut }}
    class="fixed z-50 overflow-hidden flex flex-col justify-between border border-[#CFF2FF]/20 shadow-[0_24px_60px_rgba(0,0,0,0.65)]
      inset-x-0 bottom-0 max-h-[85dvh] rounded-t-[36px]
      sm:inset-x-auto sm:right-6 sm:w-[428px] sm:max-h-[min(620px,calc(100dvh-7rem))] sm:rounded-[40px]
      {cartStore.anchor === 'nav' ? 'sm:top-24 sm:bottom-auto' : 'sm:bottom-28 sm:top-auto'}"
    style="background: linear-gradient(180deg, rgba(60, 66, 104, 0.96) 44%, rgba(72, 80, 117, 0.98) 92%); backdrop-filter: blur(24px);"
  >
    <!-- Header matching Figma #197:514, #197:521, #197:436 -->
    <div class="px-6 py-4.5 border-b border-[#CFF2FF]/15 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2.5">
        <img src="/images/cart-icon.svg" alt="Cart" class="w-6 h-6 object-contain" />
        <h2
          id="cart-popover-title"
          class="font-['Plus_Jakarta_Sans'] font-bold text-2xl text-[#ADCCDE] tracking-tight relative pb-0.5"
        >
          Cart
          <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ADCCDE]/60 rounded-full"></span>
        </h2>
      </div>

      <button
        type="button"
        onclick={() => cartStore.close()}
        class="w-9 h-9 rounded-full flex items-center justify-center text-[#CFF2FF]/70 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Close cart popup"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Scrollable Items Stack matching Figma #197:479 -->
    <div class="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-3">
      {#if cartStore.items.length === 0}
        <div class="py-12 px-4 text-center space-y-3">
          <div class="w-14 h-14 rounded-full bg-[#1A3551]/60 border border-[#CFF2FF]/20 mx-auto flex items-center justify-center text-[#CFF2FF]/70">
            <ShoppingBag class="w-6 h-6" />
          </div>
          <div class="font-['Outfit'] font-semibold text-lg text-[#CFF2FF]">
            Your smart bag is empty
          </div>
          <p class="text-xs text-[#8CAAB5] max-w-xs mx-auto">
            Browse our curated hardware to add devices for Surabaya installation.
          </p>
          <a
            href="/catalog"
            onclick={() => cartStore.close()}
            class="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#4A6FA5] hover:bg-[#5b84c0] text-white text-xs font-semibold shadow transition-colors mt-2"
          >
            <span>Explore Catalog</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </a>
        </div>
      {:else}
        {#each cartStore.items as item (item.id)}
          <!-- Compact Item Card matching Figma #197:470 (378x80, rounded 12px, border) -->
          <div
            class="rounded-[14px] p-2.5 bg-[#1A3551]/60 border border-[#CFF2FF]/15 flex items-center justify-between gap-3 transition-colors hover:border-[#CFF2FF]/30 {
              item.available ? '' : 'opacity-60'
            }"
          >
            <!-- Thumbnail + Title/Price -->
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                class="w-[68px] h-[60px] sm:w-[74px] sm:h-[66px] rounded-[12px] object-cover bg-[#071824] border border-[#CFF2FF]/20 shrink-0"
              />
              <div class="min-w-0 space-y-0.5">
                <div class="font-['Outfit'] font-medium text-sm sm:text-base text-white truncate" title={item.product.name}>
                  {item.product.name}
                </div>
                <div class="font-['Outfit'] font-semibold text-xs sm:text-sm text-[#00FBFF] tabular-nums">
                  {formatIdr(item.product.priceIdr)}
                </div>
                {#if !item.available}
                  <span class="text-[10px] text-[#FF6D6F] font-bold block">Unavailable</span>
                {/if}
              </div>
            </div>

            <!-- Inline Quantity Stepper matching Figma #197:525..580 -->
            <div
              class="h-8 sm:h-9 px-1 rounded-[8px] border-2 border-[#CFF2FF]/30 bg-[#071824]/40 flex items-center gap-1 shrink-0"
            >
              <button
                type="button"
                onclick={() => cartStore.setQuantity(item.id, item.quantity - 1)}
                class="w-6 h-6 flex items-center justify-center text-[#CFF2FF] hover:text-white transition-colors"
                aria-label={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
              >
                {#if item.quantity === 1}
                  <Trash2 class="w-3.5 h-3.5 text-[#FF6D6F] hover:text-[#ff8f91]" />
                {:else}
                  <Minus class="w-3.5 h-3.5" />
                {/if}
              </button>

              <span class="w-5 text-center font-['Outfit'] text-sm sm:text-base font-semibold text-white tabular-nums">
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
        {/each}
      {/if}
    </div>

    <!-- Sticky Glass Subtotal & Action Footer (Fills Figma's blank y:1310..1458 zone) -->
    {#if cartStore.items.length > 0}
      <div class="p-5 border-t border-[#CFF2FF]/15 bg-[#071824]/50 backdrop-blur-md space-y-3 shrink-0">
        <div class="flex items-center justify-between font-['Outfit']">
          <span class="text-xs uppercase font-bold tracking-wider text-[#8CAAB5]">
            Subtotal ({cartStore.itemCount} {cartStore.itemCount === 1 ? 'item' : 'items'})
          </span>
          <span class="text-xl font-bold text-[#00FBFF] tabular-nums">
            {formatIdr(cartStore.subtotalIdr)}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2.5 pt-1">
          <a
            href="/cart"
            onclick={() => cartStore.close()}
            class="h-11 rounded-xl border border-[#CFF2FF]/40 text-[#CFF2FF] hover:bg-white/10 hover:border-[#CFF2FF] transition-all font-['Outfit'] font-semibold text-sm flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>View Cart</span>
          </a>

          <a
            href="/checkout/location"
            onclick={() => cartStore.close()}
            class="h-11 rounded-xl bg-[#4A6FA5] hover:bg-[#5b84c0] text-white transition-all font-['Outfit'] font-semibold text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95"
          >
            <span>Check Out</span>
            <ArrowRight class="w-4 h-4" />
          </a>
        </div>
      </div>
    {/if}
  </div>
{/if}

