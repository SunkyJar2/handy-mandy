<script lang="ts">
  import type { PageData } from './$types';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { ChevronRight, ArrowRight } from 'lucide-svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Handy Mandy — Every room, a little smarter.</title>
</svelte:head>

<div class="w-full pb-20">
  <!-- Hero Section matching Figma #1:2 (y: 0 to 525px) -->
  <section class="relative w-full h-[460px] md:h-[525px] overflow-hidden flex items-center">
    <!-- Hero Background Image (Figma 30:146) with stretch and overlay -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      style="background-image: url('/images/hero-bg.png');"
    >
      <div class="absolute inset-0 bg-black/35 backdrop-blur-[1px]"></div>
      <!-- Radial vignette -->
      <div
        class="absolute inset-0"
        style="background: radial-gradient(circle at 20% 40%, rgba(38, 68, 86, 0.4) 0%, rgba(7, 24, 36, 0.85) 80%);"
      ></div>
    </div>

    <!-- Hero Content (Figma 38:7: Italiana Regular 96px) -->
    <div class="relative z-10 max-w-[1920px] mx-auto px-6 md:px-16 w-full">
      <div class="max-w-3xl">
        <h1
          class="font-['Italiana'] text-5xl sm:text-7xl lg:text-[96px] text-[#F5F5F5] leading-[1.05em] tracking-[0.01em] mb-4"
          style="text-shadow: 0px 2px 1.6px rgba(0, 0, 0, 0.29);"
        >
          Every room, <br />
          a little smarter.
        </h1>
        <p class="font-['Outfit'] text-lg sm:text-xl text-[#CFF2FF]/90 font-light max-w-xl">
          Curated smart home hardware with turnkey professional installation and certified Surabaya technicians.
        </p>
        <div class="mt-8 flex flex-wrap gap-4">
          <a
            href="/catalog"
            class="px-8 py-3.5 rounded-full font-['Outfit'] font-semibold text-lg bg-[#4A6FA5] hover:bg-[#5b84c0] text-white shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <span>Explore Catalog</span>
            <ArrowRight class="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Content Container with Horizontal Product Scrollers -->
  <div class="max-w-[1920px] mx-auto px-6 md:px-12 space-y-16 mt-12">
    <!-- 1. Featured Section (Figma 31:8) -->
    {#if data.featured.length > 0}
      <section class="space-y-6">
        <div class="flex items-center justify-between">
          <h2
            class="font-['Outfit'] font-semibold text-3xl sm:text-5xl lg:text-[64px] text-[#CFF2FF] leading-tight"
            style="text-shadow: 0px 2px 1.6px rgba(0, 0, 0, 0.29);"
          >
            Featured
          </h2>
          <a
            href="/catalog"
            class="font-['Outfit'] text-[#CFF2FF]/80 hover:text-white flex items-center gap-1 text-base sm:text-lg transition-colors"
          >
            <span>View all</span>
            <ChevronRight class="w-5 h-5" />
          </a>
        </div>

        <!-- Horizontal Carousel with gap 21px matching Figma -->
        <div class="flex gap-[21px] overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth">
          {#each data.featured as product (product.id)}
            <div class="snap-start shrink-0">
              <ProductCard {product} user={data.user} />
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- 2. Category Sections (Lighting, Security, Audio) matching Figma 93:328, 93:330, 93:446 -->
    {#each data.sections as section (section.category.id)}
      {#if section.products.length > 0}
        <section class="space-y-6">
          <div class="flex items-center justify-between">
            <h2
              class="font-['Outfit'] font-semibold text-3xl sm:text-5xl lg:text-[64px] text-[#CFF2FF] leading-tight"
              style="text-shadow: 0px 2px 1.6px rgba(0, 0, 0, 0.29);"
            >
              {section.category.name}
            </h2>
            <a
              href="/catalog?category={section.category.slug}"
              class="font-['Outfit'] text-[#CFF2FF]/80 hover:text-white flex items-center gap-1 text-base sm:text-lg transition-colors"
            >
              <span>More in {section.category.name}</span>
              <ChevronRight class="w-5 h-5" />
            </a>
          </div>

          <!-- Horizontal Carousel -->
          <div class="flex gap-[21px] overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth">
            {#each section.products as product (product.id)}
              <div class="snap-start shrink-0">
                <ProductCard {product} user={data.user} />
              </div>
            {/each}
          </div>
        </section>
      {/if}
    {/each}
  </div>
</div>
