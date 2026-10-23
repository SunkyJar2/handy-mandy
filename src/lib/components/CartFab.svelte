<script lang="ts">
  import { cartStore } from '$lib/stores/cart.svelte';
  import { scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
</script>

<aside aria-label="Floating cart shortcut">
  <button
    type="button"
    onclick={() => cartStore.toggle('fab')}
    transition:scale={{ duration: 200, easing: cubicOut }}
    class="fixed right-6 bottom-6 z-40 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center border border-[#CFF2FF]/35 shadow-[0_12px_36px_rgba(0,0,0,0.5)] transition-all hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[#00FBFF]"
    style="background: rgba(103, 114, 157, 0.65); backdrop-filter: blur(16px);"
    aria-label="Toggle cart pop-up ({cartStore.itemCount} items)"
  >
    <img
      src="/images/cart-icon.svg"
      alt="Cart"
      class="w-8 h-8 sm:w-9 sm:h-9 object-contain transition-transform group-hover:scale-110"
    />

    {#if cartStore.itemCount > 0}
      <span
        class="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center text-xs font-extrabold rounded-full bg-[#25ED82] text-[#071824] shadow-md tabular-nums border-2 border-[#071824]"
      >
        {cartStore.itemCount}
      </span>
    {/if}
  </button>
</aside>

