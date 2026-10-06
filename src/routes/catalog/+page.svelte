<script lang="ts">
  import type { PageData } from './$types';
  import ProductCard from '$lib/components/ProductCard.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Smart Home Catalog — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1920px] mx-auto px-6 md:px-12 py-10 space-y-8">
  <!-- Header -->
  <div class="space-y-3">
    <h1
      class="font-['Outfit'] font-bold text-4xl sm:text-[48px] text-[#CFF2FF] leading-tight"
      style="text-shadow: 0px 2px 1.6px rgba(0, 0, 0, 0.29);"
    >
      Smart Home Catalog
    </h1>
    <p class="font-['Outfit'] text-lg text-[#CFF2FF]/80">
      Browse verified smart home devices ready for professional Surabaya installation.
    </p>
  </div>

  <!-- Category filter pills -->
  <div class="flex flex-wrap gap-3 pb-2 border-b border-[#1A3551]">
    <a
      href="/catalog"
      class="px-5 py-2.5 rounded-full font-['Outfit'] text-base font-medium transition-all {
        !data.selectedCategory
          ? 'bg-[#4A6FA5] text-white shadow-md'
          : 'bg-[#1A3551]/60 text-[#CFF2FF]/80 hover:bg-[#1A3551] hover:text-white border border-[#4A6FA5]/30'
      }"
    >
      All Categories
    </a>
    {#each data.categories as cat}
      <a
        href="/catalog?category={cat.slug}"
        class="px-5 py-2.5 rounded-full font-['Outfit'] text-base font-medium transition-all {
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
  {#if data.products.length === 0}
    <div class="py-20 text-center space-y-4">
      <div class="text-2xl font-semibold text-[#CFF2FF]">No products found in this category.</div>
      <p class="text-sm text-[#8CAAB5]">Try selecting another category or check back soon.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {#each data.products as product (product.id)}
        <div class="flex justify-center">
          <ProductCard {product} user={data.user} />
        </div>
      {/each}
    </div>
  {/if}
</div>
