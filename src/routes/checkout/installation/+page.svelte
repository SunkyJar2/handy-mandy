<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import CheckoutStepper from '$lib/components/CheckoutStepper.svelte';
  import { formatIdr, INSTALL_FEE_PER_UNIT_IDR, HUB_PRICE_IDR } from '$lib/shared/pricing';
  import { ArrowRight, Calendar as CalendarIcon, FileText } from 'lucide-svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let includeInstallation = $state(false);
  let includeHub = $state(false);
  let preferredDate = $state('');
  let specialInstructions = $state('');

  $effect(() => {
    includeInstallation = data.includeInstallation;
    includeHub = data.includeHub;
    preferredDate = data.preferredDate ?? '';
    specialInstructions = data.specialInstructions ?? '';
  });

  // Tomorrow date string in YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Max 60 days
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 60);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  // Reactive quote computation
  let devicesSubtotalIdr = $derived(data.initialQuote.devicesSubtotalIdr);
  let installationFeeIdr = $derived(includeInstallation ? INSTALL_FEE_PER_UNIT_IDR * data.cartItemsCount : 0);
  let addOnsIdr = $derived(includeHub ? HUB_PRICE_IDR : 0);
  let totalIdr = $derived(devicesSubtotalIdr + installationFeeIdr + addOnsIdr);
</script>

<svelte:head>
  <title>Step 2: Installation & Hub — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1480px] mx-auto px-6 py-8 space-y-8">
  <!-- Stepper matching Figma 95:60 -->
  <CheckoutStepper currentStep={2} />

  <!-- 2-Column Layout matching Figma #95:60 -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- Left Main Column (col-span-8) -->
    <div class="lg:col-span-8 space-y-6">
      <h2 class="font-['Outfit'] font-bold text-2xl sm:text-[32px] text-[#CFF2FF] mb-2">
        1. Configure Installation & Add-ons
      </h2>

      <!-- Option Card 1: Professional Technician Installation (Figma 95:81 / 95:93) -->
      <div
        class="rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 border border-[#1A3551] shadow-2xl backdrop-blur-md transition-all {
          includeInstallation ? 'ring-1 ring-[#CFF2FF]/40 border-[#CFF2FF]' : ''
        }"
        style="background: rgba(26, 53, 81, 0.72);"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-2 max-w-xl">
            <h3 class="font-['Outfit'] font-bold text-xl sm:text-2xl text-[#CFF2FF] flex items-center gap-2">
              <span>🛠️</span>
              <span>Professional Technician Installation</span>
            </h3>
            <p class="font-['Outfit'] text-sm sm:text-base text-[#CFF2FF]/70 leading-relaxed">
              Includes full device unboxing, physical mounting, power/wiring setup, WiFi configuration, smart app pairing, and 30-day labor warranty.
            </p>
            <div class="font-['Outfit'] font-semibold text-sm sm:text-base text-[#25ED82] pt-1">
              + Rp 150.000 per device unit ({data.cartItemsCount} {data.cartItemsCount === 1 ? 'unit' : 'units'} = {formatIdr(data.cartItemsCount * 150000)})
            </div>
          </div>

          <!-- Toggle Button matching Figma #95:109 -->
          <button
            type="button"
            onclick={() => (includeInstallation = !includeInstallation)}
            class="relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {
              includeInstallation ? 'bg-[#25ED82]' : 'bg-[#151447] border border-[#B6C4D3]/40'
            }"
            role="switch"
            aria-checked={includeInstallation}
            aria-label="Toggle professional installation"
          >
            <span
              class="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out {
                includeInstallation ? 'translate-x-8 bg-[#071824]' : 'translate-x-0'
              }"
            ></span>
          </button>
        </div>
      </div>

      <!-- Option Card 2: Zigbee Gateway Hub (Figma 95:156 / 95:157) -->
      <div
        class="rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 border border-[#1A3551] shadow-2xl backdrop-blur-md transition-all {
          includeHub ? 'ring-1 ring-[#CFF2FF]/40 border-[#CFF2FF]' : ''
        }"
        style="background: rgba(26, 53, 81, 0.72);"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-2 max-w-xl">
            <h3 class="font-['Outfit'] font-bold text-xl sm:text-2xl text-[#CFF2FF] flex items-center gap-2">
              <span>📡</span>
              <span>Zigbee Multi-Protocol Gateway Hub Gen 3</span>
            </h3>
            <p class="font-['Outfit'] text-sm sm:text-base text-[#CFF2FF]/70 leading-relaxed">
              Enables local automation, ultra-fast response times, and connects all Zigbee 3.0 / Bluetooth mesh sensors to your home network.
            </p>
            <div class="font-['Outfit'] font-semibold text-sm sm:text-base text-[#25ED82] pt-1">
              + Rp 450.000 (1 Unit Hardware + Lifetime Local Gateway)
            </div>
          </div>

          <!-- Toggle Button -->
          <button
            type="button"
            onclick={() => (includeHub = !includeHub)}
            class="relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {
              includeHub ? 'bg-[#25ED82]' : 'bg-[#151447] border border-[#B6C4D3]/40'
            }"
            role="switch"
            aria-checked={includeHub}
            aria-label="Toggle Zigbee Gateway Hub"
          >
            <span
              class="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out {
                includeHub ? 'translate-x-8 bg-[#071824]' : 'translate-x-0'
              }"
            ></span>
          </button>
        </div>
      </div>

      <!-- Schedule & Notes Panel (Figma 95:173) -->
      <div
        class="rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 border border-[#1A3551] shadow-2xl backdrop-blur-md space-y-6"
        style="background: rgba(26, 53, 81, 0.72);"
      >
        <h3 class="font-['Outfit'] font-bold text-xl sm:text-2xl text-[#CFF2FF]">
          Preferred Schedule & Notes
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Preferred Installation Date (Figma 95:175 / 95:186) -->
          <div>
            <label for="pref-date" class="block font-['Outfit'] font-bold text-base text-[#CFF2FF]/90 mb-2 flex items-center gap-2">
              <CalendarIcon class="w-4 h-4 text-[#4A6FA5]" />
              <span>Preferred Installation Date</span>
            </label>
            <input
              id="pref-date"
              type="date"
              bind:value={preferredDate}
              min={minDate}
              max={maxDate}
              class="w-full h-12 px-4 rounded-xl bg-[#4A5A79]/50 border border-[#CFF2FF]/20 text-white font-['Outfit'] text-base focus:outline-none focus:border-[#CFF2FF] focus:ring-1 focus:ring-[#CFF2FF]"
            />
            <p class="text-xs text-[#8CAAB5] mt-1.5">
              Leave blank for earliest available (1-2 business days).
            </p>
          </div>

          <!-- Special Instructions (Figma 95:178 / 95:190) -->
          <div>
            <label for="instructions" class="block font-['Outfit'] font-bold text-base text-[#CFF2FF]/90 mb-2 flex items-center gap-2">
              <FileText class="w-4 h-4 text-[#4A6FA5]" />
              <span>Special Instructions for Technician</span>
            </label>
            <textarea
              id="instructions"
              bind:value={specialInstructions}
              rows="3"
              placeholder="e.g. Unit 4B, please call upon arrival"
              class="w-full p-3.5 rounded-xl bg-[#4A5A79]/50 border border-[#CFF2FF]/20 text-white font-['Outfit'] text-sm focus:outline-none focus:border-[#CFF2FF] focus:ring-1 focus:ring-[#CFF2FF] resize-none"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Summary Column matching Figma #95:154 -->
    <div
      class="lg:col-span-4 rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 border border-[#1A3551] shadow-2xl backdrop-blur-md space-y-6 sticky top-28"
      style="background: rgba(26, 53, 81, 0.73);"
    >
      <div class="space-y-1 pb-4 border-b border-[#CFF2FF]/10">
        <h3 class="font-['Outfit'] font-bold text-xl sm:text-[24px] text-[#CFF2FF]">
          Estimated Price Summary
        </h3>
      </div>

      <!-- Line items -->
      <div class="space-y-4 font-['Outfit'] text-base">
        <!-- Devices line -->
        <div class="flex items-center justify-between text-[#CFF2FF]/90">
          <span>Devices ({data.cartItemsCount} item{data.cartItemsCount === 1 ? '' : 's'})</span>
          <span class="font-bold text-white">{formatIdr(devicesSubtotalIdr)}</span>
        </div>

        <!-- Installation line -->
        <div class="flex items-center justify-between text-[#CFF2FF]/90">
          <span>Professional Installation</span>
          <span class="font-bold {includeInstallation ? 'text-white' : 'text-[#8CAAB5]'}">
            {includeInstallation ? formatIdr(installationFeeIdr) : 'None'}
          </span>
        </div>

        <!-- Hub line -->
        <div class="flex items-center justify-between text-[#CFF2FF]/90">
          <span>Zigbee Gateway Hub</span>
          <span class="font-bold {includeHub ? 'text-white' : 'text-[#8CAAB5]'}">
            {includeHub ? formatIdr(addOnsIdr) : 'None'}
          </span>
        </div>
      </div>

      <!-- Total -->
      <div class="pt-4 border-t border-[#CFF2FF]/20">
        <div class="flex items-center justify-between font-['Outfit'] mb-6">
          <span class="font-bold text-lg text-white">Total Booking Price</span>
          <span class="font-extrabold text-2xl text-[#25ED82]">
            {formatIdr(totalIdr)}
          </span>
        </div>

        <form method="POST" action="?/saveOptions" use:enhance>
          <input type="hidden" name="includeInstallation" value={String(includeInstallation)} />
          <input type="hidden" name="includeHub" value={String(includeHub)} />
          <input type="hidden" name="preferredDate" value={preferredDate} />
          <input type="hidden" name="specialInstructions" value={specialInstructions} />

          <button
            type="submit"
            class="w-full h-14 rounded-[15px] font-['Outfit'] font-semibold text-lg text-white transition-all shadow-xl flex items-center justify-center gap-3 bg-[#4A6FA5] hover:bg-[#5b84c0] hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Continue to Payment</span>
            <ArrowRight class="w-5 h-5" />
          </button>
        </form>

        <div class="mt-4 text-center">
          <a
            href="/checkout/location"
            class="font-['Outfit'] text-sm text-[#CFF2FF]/70 hover:text-white underline transition-colors"
          >
            ← Back to address selection
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
