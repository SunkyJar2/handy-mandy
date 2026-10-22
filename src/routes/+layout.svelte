<script lang="ts">
  import './layout.css';
  import type { LayoutProps } from './$types';
  import TopNav from '$lib/components/TopNav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import { page } from '$app/state';
  import { browser } from '$app/env';
  import { invalidateAll } from '$app/navigation';
  import { toast } from '$lib/stores/toast.svelte';

  let { data, children }: LayoutProps = $props();

  // Hide TopNav and Footer on auth pages to match Figma frames 37:7 and 47:58
  let isAuthPage = $derived(page.url.pathname === '/login' || page.url.pathname === '/register');

  $effect(() => {
    if (browser && data.user) {
      const pendingRaw = sessionStorage.getItem('pendingCartProduct');
      if (pendingRaw) {
        sessionStorage.removeItem('pendingCartProduct');
        try {
          const pending = JSON.parse(pendingRaw);
          if (pending?.id) {
            fetch('/api/v1/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: pending.id })
            })
              .then(async (res) => {
                const resData = await res.json().catch(() => ({}));
                if (res.ok) {
                  toast.show(`Added ${pending.name || 'item'} to cart!`, 'success');
                  await invalidateAll();
                } else if (res.status === 409) {
                  toast.show(resData.error?.message || 'Already in your cart.', 'info');
                } else {
                  toast.show(resData.error?.message || 'Could not add item to cart.', 'error');
                }
              })
              .catch(() => {
                toast.show('Network error adding pending item to cart.', 'error');
              });
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
    <TopNav user={data.user} cartCount={data.cartCount} />
  {/if}

  <main id="main-content" tabindex="-1" class="flex-1 w-full">
    {@render children()}
  </main>

  {#if !isAuthPage}
    <Footer />
  {/if}

  <ToastContainer />
</div>
