<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import { Eye, EyeOff, Loader2 } from 'lucide-svelte';

  interface Props {
    form: ActionData;
  }

  let { form }: Props = $props();
  let showPassword = $state(false);
  let isSubmitting = $state(false);
</script>

<svelte:head>
  <title>Create your account — Handy Mandy</title>
</svelte:head>

<div class="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#071824]">
  <!-- Background Image from Figma #47:177 with 10% opacity -->
  <div
    class="absolute inset-0 bg-cover bg-center pointer-events-none opacity-10"
    style="background-image: url('/images/auth-register-bg.png');"
  ></div>

  <!-- Radial gradient overlay -->
  <div
    class="absolute inset-0 pointer-events-none"
    style="background: radial-gradient(circle at 0% 9%, rgba(38, 68, 86, 0.8) 0%, rgba(19, 17, 75, 0.75) 30%, rgba(26, 29, 62, 0.85) 79%, rgba(39, 46, 90, 0.95) 100%);"
  ></div>

  <!-- Top Logo Bar -->
  <header class="relative z-10 p-6 md:px-12 flex items-center justify-between">
    <a href="/" class="flex items-center gap-3.5 group">
      <img
        src="/images/logo.svg"
        alt="Handy Mandy Logo"
        class="w-[60px] h-[56px] object-contain transition-transform group-hover:scale-105"
      />
      <span
        class="font-['Outfit'] font-semibold text-2xl md:text-[30px] leading-none text-[#F5F5F5] tracking-tight"
        style="text-shadow: 0px 2px 1.6px rgba(0, 0, 0, 0.29);"
      >
        Handy Mandy
      </span>
    </a>
  </header>

  <!-- Register Card (Figma frame 37:7 / 93:514: 500x650) -->
  <main class="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
    <div
      class="w-full max-w-[500px] min-h-[640px] rounded-2xl p-6 sm:p-10 flex flex-col justify-between border border-[#4A6FA5]/40 shadow-2xl backdrop-blur-md"
      style="background: rgba(26, 53, 81, 0.82);"
    >
      <div>
        <h1 class="font-['Outfit'] font-bold text-3xl sm:text-[36px] text-center text-[#CFF2FF] leading-tight mb-6">
          Create your account
        </h1>

        <form
          method="POST"
          use:enhance={() => {
            isSubmitting = true;
            return async ({ update }) => {
              isSubmitting = false;
              await update();
            };
          }}
          class="space-y-4"
        >
          <!-- Full Name field -->
          <div>
            <label for="fullName" class="block font-['Outfit'] text-sm font-medium text-[#CFF2FF] mb-1.5">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={form?.fullName ?? ''}
              placeholder="e.g Sofia Marchetti"
              class="w-full h-11 px-4 rounded-lg bg-[#071824]/60 border {form?.fieldErrors?.fullName ? 'border-[#FF6D6F]' : 'border-[#CFF2FF]/30'} text-white placeholder-[#CFF2FF]/40 text-sm focus:outline-none focus:border-[#CFF2FF] focus:ring-1 focus:ring-[#CFF2FF] transition-all"
            />
            {#if form?.fieldErrors?.fullName}
              <p class="mt-1 text-xs text-[#FF6D6F]">{form.fieldErrors.fullName}</p>
            {/if}
          </div>

          <!-- Email field -->
          <div>
            <label for="email" class="block font-['Outfit'] text-sm font-medium text-[#CFF2FF] mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autocomplete="email"
              value={form?.email ?? ''}
              placeholder="you@example.com"
              class="w-full h-11 px-4 rounded-lg bg-[#071824]/60 border {form?.fieldErrors?.email ? 'border-[#FF6D6F]' : 'border-[#CFF2FF]/30'} text-white placeholder-[#CFF2FF]/40 text-sm focus:outline-none focus:border-[#CFF2FF] focus:ring-1 focus:ring-[#CFF2FF] transition-all"
            />
            {#if form?.fieldErrors?.email}
              <p class="mt-1 text-xs text-[#FF6D6F]">{form.fieldErrors.email}</p>
            {/if}
          </div>

          <!-- Phone Number field (optional) -->
          <div>
            <label for="phone" class="block font-['Outfit'] text-sm font-medium text-[#CFF2FF] mb-1.5">
              Phone number (optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form?.phone ?? ''}
              placeholder="081234567890"
              class="w-full h-11 px-4 rounded-lg bg-[#071824]/60 border {form?.fieldErrors?.phone ? 'border-[#FF6D6F]' : 'border-[#CFF2FF]/30'} text-white placeholder-[#CFF2FF]/40 text-sm focus:outline-none focus:border-[#CFF2FF] focus:ring-1 focus:ring-[#CFF2FF] transition-all"
            />
            {#if form?.fieldErrors?.phone}
              <p class="mt-1 text-xs text-[#FF6D6F]">{form.fieldErrors.phone}</p>
            {/if}
          </div>

          <!-- Password field -->
          <div>
            <label for="password" class="block font-['Outfit'] text-sm font-medium text-[#CFF2FF] mb-1.5">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full h-11 pl-4 pr-12 rounded-lg bg-[#071824]/60 border {form?.fieldErrors?.password ? 'border-[#FF6D6F]' : 'border-[#CFF2FF]/30'} text-white placeholder-[#CFF2FF]/40 text-sm focus:outline-none focus:border-[#CFF2FF] focus:ring-1 focus:ring-[#CFF2FF] transition-all"
              />
              <button
                type="button"
                onclick={() => (showPassword = !showPassword)}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#CFF2FF]/60 hover:text-white p-1 rounded transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {#if showPassword}
                  <EyeOff class="w-4 h-4" />
                {:else}
                  <Eye class="w-4 h-4" />
                {/if}
              </button>
            </div>
            {#if form?.fieldErrors?.password}
              <p class="mt-1 text-xs text-[#FF6D6F]">{form.fieldErrors.password}</p>
            {/if}
          </div>

          <!-- Submit Button (Figma 36:94 / 36:96: Sign Up) -->
          <button
            type="submit"
            disabled={isSubmitting}
            class="w-full h-12 mt-6 rounded-xl font-['Outfit'] font-medium text-lg text-white transition-all shadow-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
            style="background: #4A6FA5;"
          >
            {#if isSubmitting}
              <Loader2 class="w-5 h-5 animate-spin" />
              <span>Creating account...</span>
            {:else}
              <span>Sign Up</span>
            {/if}
          </button>
        </form>
      </div>

      <!-- Cross link -->
      <div class="mt-6 text-center text-sm font-['Outfit'] text-[#CFF2FF]/80">
        Already have an account?
        <a href="/login" class="font-semibold text-white underline ml-1 hover:text-[#CFF2FF]">
          Sign in
        </a>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="relative z-10 py-6 px-4 text-center text-[#CFF2FF]/70 text-xs sm:text-sm font-['Outfit']">
    © 2026 HandyMandy — Professional Smart Home Installation & Services Platform.
  </footer>
</div>
