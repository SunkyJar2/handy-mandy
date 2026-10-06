<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';
  import CheckoutStepper from '$lib/components/CheckoutStepper.svelte';
  import MockSnapModal from '$lib/components/MockSnapModal.svelte';
  import { formatIdr } from '$lib/shared/pricing';
  import { MapPin, Calendar, Edit3, ShieldCheck, Loader2 } from 'lucide-svelte';

  interface Props {
    data: PageData;
    form: ActionData;
  }

  let { data, form }: Props = $props();

  let isSubmitting = $state(false);
  let isSnapModalOpen = $state(false);
  let createdOrderId = $state('');
  let createdOrderNumber = $state('');
  let createdTotalIdr = $state(0);

  $effect(() => {
    if (form?.success && form.orderId) {
      createdOrderId = form.orderId;
      createdOrderNumber = form.orderNumber;
      createdTotalIdr = form.totalIdr;

      if (form.payment?.provider === 'mock') {
        isSnapModalOpen = true;
      } else if (form.payment?.redirectUrl) {
        window.location.href = form.payment.redirectUrl;
      }
    }
  });

  function formatDateDisplay(d: string | null): string {
    if (!d) return 'Earliest Available (1-2 business days)';
    try {
      const parsed = new Date(d);
      return parsed.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return d;
    }
  }
</script>

<svelte:head>
  <title>Step 3: Review & Payment — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1480px] mx-auto px-6 py-8 space-y-8">
  <!-- Stepper matching Figma 109:188 / 138:41 -->
  <CheckoutStepper currentStep={3} />

  <!-- 2-Column Layout matching Figma #109:188 -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- Left Main Column (col-span-8) -->
    <div class="lg:col-span-8 space-y-6">
      <h2 class="font-['Outfit'] font-bold text-2xl sm:text-[32px] text-[#CFF2FF] mb-2">
        1. Review & Complete Payment
      </h2>

      {#if form?.message}
        <div class="p-4 rounded-2xl bg-[#FF6D6F]/10 border border-[#FF6D6F]/40 text-[#FF6D6F] text-sm">
          {form.message}
        </div>
      {/if}

      <!-- Card 1: Installation Location (Figma 109:213 / 109:214 / 109:245) -->
      <div
        class="rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 border border-[#1A3551] shadow-2xl backdrop-blur-md space-y-3"
        style="background: rgba(26, 53, 81, 0.72);"
      >
        <div class="flex items-center justify-between pb-2 border-b border-[#CFF2FF]/10">
          <div class="flex items-center gap-2.5">
            <MapPin class="w-5 h-5 text-[#4A6FA5]" />
            <h3 class="font-['Outfit'] font-bold text-xl text-[#CFF2FF]">
              Installation Location:
            </h3>
          </div>
          <a
            href="/checkout/location"
            class="font-['Outfit'] text-sm sm:text-base font-medium text-[#CFF2FF] hover:text-white underline flex items-center gap-1 transition-colors"
          >
            <Edit3 class="w-4 h-4" />
            <span>Change</span>
          </a>
        </div>

        <div class="font-['Outfit'] space-y-1 pt-1">
          <div class="text-xs text-[#8CAAB5] uppercase font-bold tracking-wider">Address:</div>
          <p class="text-base sm:text-lg text-white font-medium">
            {data.address.district}, {data.address.city}, {data.address.province}
          </p>
          <p class="text-sm text-[#CFF2FF]/80">
            {data.address.addressLine}, {data.address.postalCode}
          </p>
          {#if data.address.notes}
            <p class="text-xs text-[#8CAAB5] italic pt-1">
              Note: {data.address.notes}
            </p>
          {/if}
        </div>
      </div>

      <!-- Card 2: Preferred Schedule & Notes (Figma 109:218 / 109:219) -->
      <div
        class="rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 border border-[#1A3551] shadow-2xl backdrop-blur-md space-y-3"
        style="background: rgba(26, 53, 81, 0.72);"
      >
        <div class="flex items-center justify-between pb-2 border-b border-[#CFF2FF]/10">
          <div class="flex items-center gap-2.5">
            <Calendar class="w-5 h-5 text-[#4A6FA5]" />
            <h3 class="font-['Outfit'] font-bold text-xl text-[#CFF2FF]">
              Preferred Schedule & Notes
            </h3>
          </div>
          <a
            href="/checkout/installation"
            class="font-['Outfit'] text-sm sm:text-base font-medium text-[#CFF2FF] hover:text-white underline flex items-center gap-1 transition-colors"
          >
            <Edit3 class="w-4 h-4" />
            <span>Change</span>
          </a>
        </div>

        <div class="font-['Outfit'] space-y-2 pt-1">
          <div>
            <div class="text-xs text-[#8CAAB5] uppercase font-bold tracking-wider">Target Date:</div>
            <p class="text-base sm:text-lg text-white font-medium">
              {formatDateDisplay(data.preferredDate)}
            </p>
          </div>

          {#if data.specialInstructions}
            <div>
              <div class="text-xs text-[#8CAAB5] uppercase font-bold tracking-wider">Instructions:</div>
              <p class="text-sm text-[#CFF2FF]/85 bg-[#071824]/40 p-3 rounded-xl border border-[#CFF2FF]/10 mt-1">
                {data.specialInstructions}
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Right Order Summary Column matching Figma #109:204 / #109:251 -->
    <div
      class="lg:col-span-4 rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 border border-[#1A3551] shadow-2xl backdrop-blur-md space-y-6 sticky top-28"
      style="background: rgba(26, 53, 81, 0.73);"
    >
      <div class="space-y-1 pb-4 border-b border-[#CFF2FF]/10">
        <h3 class="font-['Outfit'] font-bold text-xl sm:text-[24px] text-[#CFF2FF]">
          Order Summary
        </h3>
      </div>

      <!-- Line breakdown -->
      <div class="space-y-4 font-['Outfit'] text-sm sm:text-base">
        <!-- Devices Subtotal -->
        <div class="flex items-center justify-between text-[#CFF2FF]/90">
          <span>Subtotal (Devices)</span>
          <span class="font-bold text-white">{formatIdr(data.quote.devicesSubtotalIdr)}</span>
        </div>

        <!-- Technician Installation -->
        <div class="flex items-center justify-between text-[#CFF2FF]/90">
          <div>
            <div>Technician Installation</div>
            <div class="text-xs text-[#8CAAB5]">{data.includeInstallation ? `${data.cartItemsCount} Unit${data.cartItemsCount === 1 ? '' : 's'}` : '0 Unit'}</div>
          </div>
          <span class="font-bold {data.includeInstallation ? 'text-white' : 'text-[#8CAAB5]'}">
            {formatIdr(data.quote.installationFeeIdr)}
          </span>
        </div>

        <!-- Additional Services (Hub) -->
        <div class="flex items-center justify-between text-[#CFF2FF]/90">
          <div>
            <div>Additional Services</div>
            <div class="text-xs text-[#8CAAB5]">{data.includeHub ? 'Gateway Hub Gen 3' : 'None'}</div>
          </div>
          <span class="font-bold {data.includeHub ? 'text-white' : 'text-[#8CAAB5]'}">
            {formatIdr(data.quote.addOnsIdr)}
          </span>
        </div>
      </div>

      <!-- Divider (Figma 109:268) -->
      <div class="pt-4 border-t border-[#CFF2FF]/20">
        <div class="flex items-center justify-between font-['Outfit'] mb-6">
          <span class="font-bold text-lg text-white">Total Amount</span>
          <span class="font-extrabold text-2xl text-[#25ED82]">
            {formatIdr(data.quote.totalIdr)}
          </span>
        </div>

        <!-- Confirm Payment Button (Figma 109:278 / 109:280) -->
        <form
          method="POST"
          action="?/createOrder"
          use:enhance={() => {
            isSubmitting = true;
            return async ({ update }) => {
              isSubmitting = false;
              await update();
            };
          }}
        >
          <button
            type="submit"
            disabled={isSubmitting}
            class="w-full h-14 rounded-[15px] font-['Outfit'] font-semibold text-lg text-white transition-all shadow-xl flex items-center justify-center gap-3 bg-[#4A6FA5] hover:bg-[#5b84c0] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          >
            {#if isSubmitting}
              <Loader2 class="w-5 h-5 animate-spin" />
              <span>Securing order...</span>
            {:else}
              <ShieldCheck class="w-5 h-5" />
              <span>Confirm Payment</span>
            {/if}
          </button>
        </form>

        <p class="text-center text-xs text-[#8CAAB5] mt-3">
          Instant confirmation with 256-bit encryption
        </p>
      </div>
    </div>
  </div>
</div>

<MockSnapModal
  isOpen={isSnapModalOpen}
  orderId={createdOrderId}
  orderNumber={createdOrderNumber}
  totalAmountIdr={createdTotalIdr}
  onClose={() => (isSnapModalOpen = false)}
/>
