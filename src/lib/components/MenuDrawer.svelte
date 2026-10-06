<script lang="ts">
  import type { UserDto } from '$lib/shared/types';
  import { X, ShoppingBag, ShoppingCart, Calendar, Users, Settings, LogOut, LogIn, UserPlus } from 'lucide-svelte';

  interface Props {
    isOpen: boolean;
    user: UserDto | null;
    cartCount: number;
    onClose: () => void;
  }

  let { isOpen, user, cartCount, onClose }: Props = $props();
</script>

{#if isOpen}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
    onclick={onClose}
  ></div>

  <!-- Drawer -->
  <aside
    class="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-[#0c1c2e] border-l border-[#4A6FA5]/40 p-6 flex flex-col justify-between shadow-2xl transition-transform animate-in slide-in-from-right duration-300"
  >
    <div class="space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-[#1A3551]">
        <div class="flex items-center gap-3">
          <img src="/images/logo.svg" alt="Handy Mandy" class="w-10 h-10 object-contain" />
          <span class="text-xl font-bold tracking-tight text-white font-['Outfit']">Handy Mandy</span>
        </div>
        <button
          onclick={onClose}
          class="text-[#CFF2FF]/70 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      {#if user}
        <div class="p-3.5 rounded-xl bg-[#1A3551]/60 border border-[#4A6FA5]/30">
          <div class="text-xs text-[#8CAAB5] uppercase font-semibold tracking-wider">Signed in as</div>
          <div class="text-base font-semibold text-white truncate">{user.fullName}</div>
          <div class="text-xs text-[#CFF2FF]/70 truncate">{user.email}</div>
          {#if user.role === 'ADMIN'}
            <span class="inline-block mt-2 px-2 py-0.5 text-xs font-bold rounded bg-[#4A6FA5] text-white">ADMIN</span>
          {/if}
        </div>
      {/if}

      <nav class="flex flex-col gap-1.5">
        <a
          href="/catalog"
          onclick={onClose}
          class="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-lg text-[#CFF2FF] hover:bg-[#1A3551] hover:text-white transition-colors"
        >
          <ShoppingBag class="w-5 h-5 text-[#4A6FA5]" />
          <span>Catalog</span>
        </a>

        <a
          href="/cart"
          onclick={onClose}
          class="flex items-center justify-between px-3 py-2.5 rounded-lg text-lg text-[#CFF2FF] hover:bg-[#1A3551] hover:text-white transition-colors"
        >
          <div class="flex items-center gap-3.5">
            <ShoppingCart class="w-5 h-5 text-[#4A6FA5]" />
            <span>Cart</span>
          </div>
          {#if cartCount > 0}
            <span class="px-2 py-0.5 text-xs font-bold rounded-full bg-[#4A6FA5] text-white">
              {cartCount}
            </span>
          {/if}
        </a>

        <a
          href="/bookings"
          onclick={onClose}
          class="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-lg text-[#CFF2FF] hover:bg-[#1A3551] hover:text-white transition-colors"
        >
          <Calendar class="w-5 h-5 text-[#4A6FA5]" />
          <span>My Bookings</span>
        </a>

        <a
          href="/technicians"
          onclick={onClose}
          class="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-lg text-[#CFF2FF] hover:bg-[#1A3551] hover:text-white transition-colors"
        >
          <Users class="w-5 h-5 text-[#4A6FA5]" />
          <span>Technicians</span>
        </a>

        {#if user?.role === 'ADMIN'}
          <div class="pt-3 mt-2 border-t border-[#1A3551]">
            <a
              href="/admin/catalog"
              onclick={onClose}
              class="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-lg text-[#25ED82] hover:bg-[#1A3551] transition-colors"
            >
              <Settings class="w-5 h-5 text-[#25ED82]" />
              <span>Manage Catalog</span>
            </a>
          </div>
        {/if}
      </nav>
    </div>

    <div class="pt-4 border-t border-[#1A3551]">
      {#if user}
        <form method="POST" action="/logout">
          <button
            type="submit"
            class="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#FF6D6F]/40 text-[#FF6D6F] hover:bg-[#FF6D6F]/10 transition-colors font-medium"
          >
            <LogOut class="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </form>
      {:else}
        <div class="flex flex-col gap-2">
          <a
            href="/login"
            onclick={onClose}
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A6FA5] hover:bg-[#5b84c0] text-white transition-colors font-medium shadow-md"
          >
            <LogIn class="w-4 h-4" />
            <span>Sign In</span>
          </a>
          <a
            href="/register"
            onclick={onClose}
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#CFF2FF]/40 text-[#CFF2FF] hover:bg-white/5 transition-colors font-medium text-sm"
          >
            <UserPlus class="w-4 h-4" />
            <span>Create Account</span>
          </a>
        </div>
      {/if}
    </div>
  </aside>
{/if}
