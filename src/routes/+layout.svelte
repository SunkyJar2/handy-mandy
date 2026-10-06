<script lang="ts">
  import './layout.css';
  import type { LayoutProps } from './$types';
  import TopNav from '$lib/components/TopNav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import { page } from '$app/state';

  let { data, children }: LayoutProps = $props();

  // Hide TopNav and Footer on auth pages to match Figma frames 37:7 and 47:58
  let isAuthPage = $derived(page.url.pathname === '/login' || page.url.pathname === '/register');
</script>

<svelte:head>
  <link rel="icon" href="/images/logo.svg" />
</svelte:head>

<div class="min-h-screen flex flex-col justify-between">
  {#if !isAuthPage}
    <TopNav user={data.user} cartCount={data.cartCount} />
  {/if}

  <main class="flex-1 w-full">
    {@render children()}
  </main>

  {#if !isAuthPage}
    <Footer />
  {/if}

  <ToastContainer />
</div>
