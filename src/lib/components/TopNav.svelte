<script lang="ts">
  import { page } from '$app/state';
  import type { UserDto } from '$lib/shared/types';
  import { cartStore } from '$lib/stores/cart.svelte';

  interface Props {
    user: UserDto | null;
    cartCount?: number;
    onOpenDrawer: () => void;
  }

  let { user, onOpenDrawer }: Props = $props();

  const navLinks = [
    { label: 'Catalog', href: '/catalog' },
    { label: 'Booking', href: '/bookings' },
    { label: 'Technicians', href: '/technicians' }
  ];

  function handleCartClick() {
    if (page.url.pathname === '/cart') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      cartStore.toggle('nav');
    }
  }
</script>

<header
  class="sticky top-0 z-40 w-full h-20 transition-all border-b border-[#CFF2FF]/10 shadow-lg"
  style="background: linear-gradient(90deg, rgba(74, 111, 165, 0.8) 0%, rgba(28, 42, 63, 0.58) 100%); backdrop-filter: blur(29.65px);"
>
  <div class="max-w-[1920px] mx-auto h-full px-4 sm:px-6 md:px-12 flex items-center justify-between gap-4">
    <!-- Left: Hamburger Menu (Figma #199:150) + Brand Logo & Title -->
    <div class="flex items-center gap-3 sm:gap-4 md:gap-5">
      <button
        onclick={onOpenDrawer}
        class="p-1.5 sm:p-2 text-[#CFF2FF] hover:text-white rounded-lg transition-transform active:scale-95 shrink-0"
        aria-label="Open navigation menu"
      >
        <img src="/images/menu-icon.svg" alt="Menu" class="w-8 h-8 md:w-9 md:h-9 object-contain" />
      </button>

      <a href="/" class="flex items-center gap-2.5 sm:gap-3.5 group">
        <img
          src="/images/logo.svg"
          alt="Handy Mandy Logo"
          class="w-[50px] h-[46px] sm:w-[60px] sm:h-[56px] md:w-[72px] md:h-[68px] object-contain transition-transform group-hover:scale-105"
        />
        <span
          class="font-['Outfit'] font-semibold text-xl sm:text-2xl md:text-[30px] leading-none text-[#F5F5F5] tracking-tight whitespace-nowrap"
          style="text-shadow: 0px 2px 1.6px rgba(0, 0, 0, 0.29);"
        >
          Handy Mandy
        </span>
      </a>
    </div>

    <!-- Center Navigation Links (Figma #199:153: Catalog, Booking, Technicians) -->
    <nav class="hidden lg:flex items-center gap-8 xl:gap-[73px]">
      {#each navLinks as link}
        {@const isActive = page.url.pathname === link.href || (link.href !== '/' && page.url.pathname.startsWith(link.href))}
        <a
          href={link.href}
          class="relative font-['Plus_Jakarta_Sans'] text-xl md:text-[22px] xl:text-[26px] transition-colors hover:text-white {
            isActive ? 'text-[#CFF2FF] font-medium' : 'text-[#CFF2FF]/85 font-normal'
          }"
          aria-current={isActive ? 'page' : undefined}
        >
          {link.label}
          {#if isActive}
            <span class="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#CFF2FF] rounded-full"></span>
          {/if}
        </a>
      {/each}

      {#if user?.role === 'ADMIN'}
        <a
          href="/admin/catalog"
          class="font-['Plus_Jakarta_Sans'] text-lg text-[#25ED82] hover:text-[#5aff9f] font-semibold transition-colors"
        >
          Admin
        </a>
      {/if}
    </nav>

    <!-- Right Controls: Shopping Cart SVG (#199:149) + Auth Button -->
    <div class="flex items-center gap-3 sm:gap-4 md:gap-6">
      <!-- Shopping Cart Button with live badge -->
      <button
        type="button"
        onclick={handleCartClick}
        class="relative p-2 text-[#CFF2FF] hover:text-white rounded-lg transition-transform active:scale-95"
        aria-label="Open shopping cart popover"
      >
        <img
          src="/images/cart-icon.svg"
          alt="Cart"
          class="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain"
        />
        {#if cartStore.itemCount > 0}
          <span
            class="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full bg-[#25ED82] text-[#071824] shadow-sm tabular-nums"
          >
            {cartStore.itemCount}
          </span>
        {/if}
      </button>

      {#if user}
        <div class="hidden sm:flex items-center gap-3">
          <div class="text-right">
            <div class="text-sm font-semibold text-white truncate max-w-[140px]">{user.fullName}</div>
            <div class="text-[11px] text-[#8CAAB5] uppercase font-bold tracking-wider">{user.role}</div>
          </div>
          <form method="POST" action="/logout">
            <button
              type="submit"
              class="px-3.5 py-1.5 rounded-lg border border-[#CFF2FF]/40 text-xs font-medium text-[#CFF2FF] hover:bg-white/10 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      {:else}
        <a
          href="/login"
          class="flex items-center justify-center w-[100px] sm:w-[115px] h-[38px] sm:h-[43px] border border-[#CFF2FF] text-[#CFF2FF] hover:bg-[#CFF2FF]/10 rounded-lg text-base sm:text-[20px] font-['Outfit'] tracking-[0.12em] transition-all shadow-sm shrink-0"
        >
          Sign In
        </a>
      {/if}
    </div>
  </div>
</header>
