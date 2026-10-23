<script lang="ts">
  import { untrack } from 'svelte';
  import './layout.css';
  import type { LayoutProps } from './$types';
  import TopNav from '$lib/components/TopNav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import MenuDrawer from '$lib/components/MenuDrawer.svelte';
  import CartPopover from '$lib/components/CartPopover.svelte';
  import CartFab from '$lib/components/CartFab.svelte';
  import { page } from '$app/state';
  import { browser } from '$app/env';
  import { invalidateAll } from '$app/navigation';
  import { toast } from '$lib/stores/toast.svelte';
  import { cartStore } from '$lib/stores/cart.svelte';

  let { data, children }: LayoutProps = $props();

  let isDrawerOpen = $state(false);

  // Hide TopNav, Footer, FAB on auth pages
  let isAuthPage = $derived(page.url.pathname === '/login' || page.url.pathname === '/register');
  let isHomeOrCatalog = $derived(page.url.pathname === '/' || page.url.pathname === '/catalog');

  // Hydrate cartStore whenever data changes
  $effect(() => {
    const cart = data.cart;
    untrack(() => {
      cartStore.hydrate(cart);
    });
  });

  $effect(() => {
    if (browser && data.user) {
      const pendingRaw = sessionStorage.getItem('pendingCartProduct');
      if (pendingRaw) {
        sessionStorage.removeItem('pendingCartProduct');
        try {
          const pending = JSON.parse(pendingRaw);
          if (pending?.id) {
            cartStore.addProduct(pending, true);
          }
        } catch {}
      }
    }
  });
</script>

<svelte:head>
  <link rel="icon" href="/images/logo.svg" />
</svelte:head>

<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#25ED82] focus:text-[#071824] focus:font-bold"
>
  Skip to main content
</a>

<div class="min-h-screen flex flex-col justify-between">
  {#if !isAuthPage}
    <TopNav
      user={data.user}
      cartCount={cartStore.itemCount}
      onOpenDrawer={() => (isDrawerOpen = true)}
    />
  {/if}

  <main id="main-content" tabindex="-1" class="flex-1 w-full">
    {@render children()}
  </main>

  {#if !isAuthPage}
    <Footer />
  {/if}

  <ToastContainer />
</div>

<!-- Overlays mounted outside <header> to escape backdrop-filter containing block -->
<MenuDrawer
  isOpen={isDrawerOpen}
  user={data.user}
  onClose={() => (isDrawerOpen = false)}
/>

<CartPopover />

{#if !isAuthPage && isHomeOrCatalog}
  <CartFab />
{/if}
