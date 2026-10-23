<script lang="ts">
  import type { PageData } from './$types';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import FeaturedHeroCard from '$lib/components/FeaturedHeroCard.svelte';
  import SearchPill from '$lib/components/SearchPill.svelte';
  import { filterProductsByQuery } from '$lib/shared/cart-selection';
  import { ChevronRight, ArrowRight } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let searchQuery = $state('');

  let filteredFeatured = $derived(filterProductsByQuery(data.featured, searchQuery));

  let filteredSections = $derived(
    data.sections.map((section) => ({
      ...section,
      products: filterProductsByQuery(section.products, searchQuery)
    }))
  );

  function handleSearchSubmit(query: string) {
    if (query.trim()) {
      goto(`/catalog?q=${encodeURIComponent(query.trim())}`);
    }
  }
</script>

<svelte:head>
  <title>Handy Mandy — Every room, a little smarter.</title>
</svelte:head>

<div class="w-full pb-20">
  <!-- Hero Section matching Figma #1:2 / #197:143 (Pure room photography + Italiana text) -->
  <section class="relative w-full h-[460px] md:h-[525px] overflow-hidden flex items-center">
    <!-- Hero Background Image (Figma 30:146) with stretch and overlay -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      style="background-image: url('/images/hero-bg.png');"
    >
      <div class="absolute inset-0 bg-black/35 backdrop-blur-[1px]"></div>
      <!-- Radial vignette matching Figma radial-gradient -->
      <div
        class="absolute inset-0"
        style="background: radial-gradient(circle at 20% 40%, rgba(38, 68, 86, 0.4) 0%, rgba(7, 24, 36, 0.85) 80%);"
      ></div>
    </div>

    <!-- Hero Content (Figma 38:7: Italiana Regular 96px) -->
    <div class="relative z-10 max-w-[1920px] mx-auto px-6 md:px-16 w-full">
      <div class="max-w-4xl">
        <h1
          class="font-['Italiana'] text-5xl sm:text-7xl lg:text-[96px] text-[#F5F5F5] leading-[1.05em] tracking-[0.01em]"
          style="text-shadow: 0px 2px 1.6px rgba(0, 0, 0, 0.29);"
        >
          Every room, <br />
          a little smarter.
        </h1>
      </div>
    </div>
  </section>

  <!-- Content Container -->
  <div class="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 space-y-16 mt-10 sm:mt-14">
    <!-- 1. Featured Section Header with Search Pill matching Figma #31:8 + #220:288 -->
    <section class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            class="font-['Outfit'] font-semibold text-3xl sm:text-5xl lg:text-[64px] text-[#CFF2FF] leading-tight"
            style="text-shadow: 0px 2px 1.6px rgba(0, 0, 0, 0.29);"
          >
            Featured
          </h2>
        </div>

        <!-- Search Bar Pill matching Figma #220:288 -->
        <SearchPill
          bind:value={searchQuery}
          placeholder="Search devices..."
          onsubmit={handleSearchSubmit}
        />
      </div>

      {#if searchQuery.trim().length > 0}
        <!-- Search query active: Flat grid with clear message -->
        <div class="space-y-4">
          <div class="text-sm font-['Outfit'] text-[#8CAAB5]">
            Showing results matching "<span class="text-white font-medium">{searchQuery}</span>" —
            <a href="/catalog?q={encodeURIComponent(searchQuery)}" class="text-[#00FBFF] underline hover:text-white ml-1">
              View in full catalog
            </a>
          </div>

          {#if filteredFeatured.length === 0 && filteredSections.every((s) => s.products.length === 0)}
            <div class="py-16 text-center text-[#8CAAB5] bg-[#1A3551]/30 rounded-2xl border border-white/10">
              No devices found matching "{searchQuery}". Try another keyword or browse categories below.
            </div>
          {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {#each filteredFeatured as product (product.id)}
                <div class="flex justify-center">
                  <ProductCard {product} user={data.user} />
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {:else if data.featured.length > 0}
        <!-- Default State: Asymmetric 2-Row Featured Bento Grid matching Figma #196:86 + #93:495..342 -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <!-- Left Column (lg:col-span-5): Giant Hero Card (#196:86) spanning 2 rows -->
          <div class="lg:col-span-5 flex">
            <FeaturedHeroCard product={data.featured[0]} user={data.user} />
          </div>

          <!-- Right Column (lg:col-span-7): 2-Row Bento Card Matrix (#93:495..342) -->
          <div class="lg:col-span-7 flex flex-col justify-between overflow-hidden">
            {#if data.featured.length > 1}
              <div
                class="grid grid-rows-1 sm:grid-rows-2 grid-flow-col auto-cols-[290px] sm:auto-cols-[330px] gap-[21px] overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
              >
                {#each data.featured.slice(1) as product (product.id)}
                  <div class="snap-start shrink-0">
                    <ProductCard {product} user={data.user} />
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </section>

    <!-- 2. Category Sections (Lighting, Security, Audio) matching Figma 93:328, 93:330, 93:446 -->
    {#each filteredSections as section (section.category.id)}
      {#if section.products.length > 0}
        <section class="space-y-6">
          <div class="flex items-center justify-between pb-2 border-b border-[#CFF2FF]/10">
            <h2
              class="font-['Outfit'] font-semibold text-3xl sm:text-5xl lg:text-[54px] text-[#CFF2FF] leading-tight"
              style="text-shadow: 0px 2px 1.6px rgba(0, 0, 0, 0.29);"
            >
              {section.category.name}
            </h2>
            <a
              href="/catalog?category={section.category.slug}"
              class="font-['Outfit'] text-[#CFF2FF]/80 hover:text-white flex items-center gap-1 text-sm sm:text-base transition-colors group"
            >
              <span>More in {section.category.name}</span>
              <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <!-- Horizontal 5-card Carousel matching Figma 93:352..448 -->
          <div class="flex gap-[21px] overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth">
            {#each section.products as product (product.id)}
              <div class="snap-start shrink-0 w-[290px] sm:w-[336px]">
                <ProductCard {product} user={data.user} />
              </div>
            {/each}
          </div>
        </section>
      {/if}
    {/each}
  </div>
</div>
