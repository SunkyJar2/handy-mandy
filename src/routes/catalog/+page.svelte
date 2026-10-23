<script lang="ts">
  import type { PageData } from './$types';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import SearchPill from '$lib/components/SearchPill.svelte';
  import { filterProductsByQuery } from '$lib/shared/cart-selection';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let searchQuery = $state('');

  $effect(() => {
    if (data.initialQuery !== undefined) {
      searchQuery = data.initialQuery;
    }
  });

  let filteredProducts = $derived(filterProductsByQuery(data.products, searchQuery));
</script>

<svelte:head>
  <title>Smart Home Catalog — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 py-10 space-y-8">
  <!-- Header with Title + Search Pill -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
    <div class="space-y-2">
      <h1
        class="font-['Outfit'] font-bold text-3xl sm:text-4xl lg:text-[48px] text-[#CFF2FF] leading-tight"
        style="text-shadow: 0px 2px 1.6px rgba(0, 0, 0, 0.29);"
      >
        Smart Home Catalog
      </h1>
      <p class="font-['Outfit'] text-base sm:text-lg text-[#CFF2FF]/80">
        Browse verified smart home devices ready for professional Surabaya installation.
      </p>
    </div>

    <!-- Search Pill matching Figma #220:288 -->
    <SearchPill
      bind:value={searchQuery}
      placeholder="Search catalog devices..."
    />
  </div>

  <!-- Category filter pills -->
  <div class="flex flex-wrap gap-2.5 sm:gap-3 pb-3 border-b border-[#1A3551]">
    <a
      href="/catalog{searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}"
      class="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-['Outfit'] text-sm sm:text-base font-medium transition-all {
        !data.selectedCategory
          ? 'bg-[#4A6FA5] text-white shadow-md'
          : 'bg-[#1A3551]/60 text-[#CFF2FF]/80 hover:bg-[#1A3551] hover:text-white border border-[#4A6FA5]/30'
      }"
    >
      All Categories
    </a>
    {#each data.categories as cat}
      <a
        href="/catalog?category={cat.slug}{searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}"
        class="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-['Outfit'] text-sm sm:text-base font-medium transition-all {
          data.selectedCategory === cat.slug
            ? 'bg-[#4A6FA5] text-white shadow-md'
            : 'bg-[#1A3551]/60 text-[#CFF2FF]/80 hover:bg-[#1A3551] hover:text-white border border-[#4A6FA5]/30'
        }"
      >
        {cat.name}
      </a>
    {/each}
  </div>

  <!-- Products Grid -->
  {#if filteredProducts.length === 0}
    <div class="py-20 text-center space-y-4 bg-[#1A3551]/25 rounded-2xl border border-white/10 max-w-xl mx-auto p-8">
      <div class="text-2xl font-semibold text-[#CFF2FF]">No products found.</div>
      <p class="text-sm text-[#8CAAB5]">
        {searchQuery ? `No devices matching "${searchQuery}".` : 'Try selecting another category or check back soon.'}
      </p>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {#each filteredProducts as product (product.id)}
        <div class="flex justify-center w-full min-w-0">
          <ProductCard {product} user={data.user} />
        </div>
      {/each}
    </div>
  {/if}
</div>
