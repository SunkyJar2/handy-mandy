<script lang="ts">
  import { page } from '$app/state';
  import type { UserDto } from '$lib/shared/types';
  import MenuDrawer from './MenuDrawer.svelte';

  interface Props {
    user: UserDto | null;
    cartCount: number;
  }

  let { user, cartCount }: Props = $props();
  let isDrawerOpen = $state(false);

  const navLinks = [
    { label: 'Catalog', href: '/catalog' },
    { label: 'Cart', href: '/cart', badge: true },
    { label: 'Booking', href: '/bookings' },
    { label: 'Technicians', href: '/technicians' }
  ];
</script>

<header
  class="sticky top-0 z-40 w-full h-20 transition-all border-b border-[#CFF2FF]/10 shadow-lg"
  style="background: linear-gradient(90deg, rgba(74, 111, 165, 0.8) 0%, rgba(28, 42, 63, 0.58) 100%); backdrop-filter: blur(29.65px);"
>
  <div class="max-w-[1920px] mx-auto h-full px-6 md:px-12 flex items-center justify-between">
    <!-- Brand -->
    <a href="/" class="flex items-center gap-3.5 group">
      <img
        src="/images/logo.svg"
        alt="Handy Mandy Logo"
        class="w-[60px] h-[56px] md:w-[72px] md:h-[68px] object-contain transition-transform group-hover:scale-105"
      />
      <span
        class="font-['Outfit'] font-semibold text-2xl md:text-[30px] leading-none text-[#F5F5F5] tracking-tight"
        style="text-shadow: 0px 2px 1.6px rgba(0, 0, 0, 0.29);"
      >
        Handy Mandy
      </span>
    </a>

    <!-- Center Navigation Links (desktop) -->
    <nav class="hidden lg:flex items-center gap-8 xl:gap-[73px]">
      {#each navLinks as link}
        {@const isActive = page.url.pathname === link.href || (link.href !== '/' && page.url.pathname.startsWith(link.href))}
        <a
          href={link.href}
          class="relative font-['Outfit'] text-xl md:text-2xl transition-colors hover:text-white {
            isActive ? 'text-[#CFF2FF] font-medium' : 'text-[#CFF2FF]/85 font-normal'
          }"
          aria-current={isActive ? 'page' : undefined}
        >
          {link.label}
          {#if link.badge && cartCount > 0}
            <span
              class="absolute -top-2 -right-4 px-1.5 py-0.2 text-xs font-bold rounded-full bg-[#25ED82] text-[#071824] shadow-sm animate-in zoom-in"
            >
              {cartCount}
            </span>
          {/if}
          {#if isActive}
            <span class="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#CFF2FF] rounded-full"></span>
          {/if}
        </a>
      {/each}

      {#if user?.role === 'ADMIN'}
        <a
          href="/admin/catalog"
          class="font-['Outfit'] text-lg text-[#25ED82] hover:text-[#5aff9f] font-semibold transition-colors"
        >
          Admin
        </a>
      {/if}
    </nav>

    <!-- Right Controls -->
    <div class="flex items-center gap-4">
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
          class="hidden sm:flex items-center justify-center w-[115px] h-[43px] border border-[#CFF2FF] text-[#CFF2FF] hover:bg-[#CFF2FF]/10 rounded-lg text-[20px] font-['Outfit'] tracking-[0.12em] transition-all shadow-sm"
        >
          Sign In
        </a>
      {/if}

      <!-- Hamburger Button -->
      <button
        onclick={() => (isDrawerOpen = true)}
        class="p-2 text-[#CFF2FF] hover:text-white rounded-lg transition-transform active:scale-95"
        aria-label="Open menu"
      >
        <img src="/images/menu-icon.svg" alt="Menu" class="w-8 h-8 object-contain" />
      </button>
    </div>
  </div>
</header>

<MenuDrawer
  isOpen={isDrawerOpen}
  {user}
  {cartCount}
  onClose={() => (isDrawerOpen = false)}
/>
