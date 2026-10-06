<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import CheckoutStepper from '$lib/components/CheckoutStepper.svelte';
  import AddressDialog from '$lib/components/AddressDialog.svelte';
  import { formatIdr } from '$lib/shared/pricing';
  import { MapPin, Plus, CheckCircle2, ArrowRight } from 'lucide-svelte';
  import { invalidateAll } from '$app/navigation';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let selectedAddressId = $state(data.savedAddressId || data.addresses[0]?.id || '');
  let isAddDialogOpen = $state(false);

  function handleAddressAdded(newAddress: any) {
    selectedAddressId = newAddress.id;
    invalidateAll();
  }
</script>

<svelte:head>
  <title>Step 1: Location — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1480px] mx-auto px-6 py-8 space-y-8">
  <!-- Stepper matching Figma 67:23 -->
  <CheckoutStepper currentStep={1} />

  <!-- 2-Column Layout matching Figma #67:23 (Left 943px, Right 488px) -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- Left Main Column: Address Selection (col-span-8) -->
    <div
      class="lg:col-span-8 rounded-[30px] sm:rounded-[40px] p-6 sm:p-10 border border-[#1A3551] shadow-2xl backdrop-blur-md space-y-6"
      style="background: rgba(26, 53, 81, 0.72);"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#CFF2FF]/10">
        <div>
          <h2 class="font-['Outfit'] font-bold text-2xl sm:text-[28px] text-[#CFF2FF]">
            1. Location
          </h2>
          <p class="font-['Outfit'] text-base text-[#CFF2FF]/85 mt-1">
            Where should our technician go for the installation?
          </p>
        </div>

        <button
          type="button"
          onclick={() => (isAddDialogOpen = true)}
          class="inline-flex items-center gap-2 h-10 px-5 rounded-[15px] font-['Outfit'] font-semibold text-sm text-white transition-all shadow-md hover:brightness-110 active:scale-95 shrink-0"
          style="background: rgba(74, 111, 165, 0.45); border: 1px solid rgba(207, 242, 255, 0.3);"
        >
          <Plus class="w-4 h-4" />
          <span>+ Add New Address</span>
        </button>
      </div>

      <!-- Address Cards List -->
      {#if data.addresses.length === 0}
        <div class="p-8 text-center rounded-2xl border border-dashed border-[#CFF2FF]/30 space-y-4">
          <MapPin class="w-12 h-12 text-[#4A6FA5] mx-auto" />
          <div class="text-lg font-semibold text-white">No addresses saved yet</div>
          <p class="text-sm text-[#8CAAB5]">
            Please add your Surabaya installation address to proceed.
          </p>
          <button
            type="button"
            onclick={() => (isAddDialogOpen = true)}
            class="px-6 py-2.5 rounded-xl bg-[#4A6FA5] text-white text-sm font-semibold hover:brightness-110 transition-all shadow"
          >
            Add Address Now
          </button>
        </div>
      {:else}
        <div class="space-y-4">
          {#each data.addresses as addr (addr.id)}
            {@const isSelected = selectedAddressId === addr.id}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              onclick={() => (selectedAddressId = addr.id)}
              class="relative cursor-pointer rounded-2xl p-5 border transition-all duration-200 {
                isSelected
                  ? 'border-[#CFF2FF] bg-[#1A3551] shadow-lg ring-1 ring-[#CFF2FF]/40'
                  : 'border-[#1A3551] bg-[#071824]/40 hover:border-[#4A6FA5]/60 hover:bg-[#071824]/60'
              }"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-3.5">
                  <div class="mt-1">
                    <div
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors {
                        isSelected ? 'border-[#25ED82] bg-[#25ED82]' : 'border-[#8CAAB5]'
                      }"
                    >
                      {#if isSelected}
                        <div class="w-2 h-2 rounded-full bg-[#071824]"></div>
                      {/if}
                    </div>
                  </div>

                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="font-['Outfit'] font-bold text-lg text-white">
                        {addr.district}, {addr.city}
                      </span>
                      {#if addr.isDefault}
                        <span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#4A6FA5]/60 text-white">
                          Default
                        </span>
                      {/if}
                    </div>

                    <p class="font-['Outfit'] text-sm sm:text-base text-[#CFF2FF]/90">
                      {addr.addressLine}, {addr.postalCode}
                    </p>

                    {#if addr.notes}
                      <p class="text-xs text-[#8CAAB5] italic">
                        Note: {addr.notes}
                      </p>
                    {/if}
                  </div>
                </div>

                <MapPin class="w-5 h-5 text-[#4A6FA5] shrink-0" />
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Right Column: Selected Devices & Continue (col-span-4) matching Figma #68:53 -->
    <div
      class="lg:col-span-4 rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 border border-[#1A3551] shadow-2xl backdrop-blur-md space-y-6"
      style="background: rgba(26, 53, 81, 0.73);"
    >
      <div class="space-y-1 pb-4 border-b border-[#CFF2FF]/10">
        <h3 class="font-['Outfit'] font-bold text-xl sm:text-[24px] text-[#CFF2FF]">
          Selected Devices ({data.cartItems.length})
        </h3>
        <p class="text-xs text-[#8CAAB5]">
          Items to be installed at your location
        </p>
      </div>

      <!-- Items List -->
      <div class="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
        {#each data.cartItems as item (item.id)}
          <div class="flex items-center justify-between gap-3 text-sm font-['Outfit']">
            <span class="text-[#CFF2FF] truncate font-medium max-w-[240px]">
              {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.product.name}
            </span>
            <span class="text-[#CFF2FF]/90 font-semibold shrink-0">
              {formatIdr(item.product.priceIdr * item.quantity)}
            </span>
          </div>
        {/each}
      </div>

      <div class="pt-4 border-t border-[#CFF2FF]/15">
        <div class="flex items-center justify-between text-base sm:text-lg font-['Outfit'] mb-6">
          <span class="text-[#CFF2FF]/85 font-medium">Devices Total</span>
          <span class="text-[#25ED82] font-bold text-xl">
            {formatIdr(data.devicesTotalIdr)}
          </span>
        </div>

        <form method="POST" action="?/selectAddress" use:enhance>
          <input type="hidden" name="addressId" value={selectedAddressId} />
          <button
            type="submit"
            disabled={!selectedAddressId}
            class="w-full h-14 rounded-[15px] font-['Outfit'] font-semibold text-lg text-white transition-all shadow-xl flex items-center justify-center gap-3 {
              selectedAddressId
                ? 'bg-[#4A6FA5] hover:bg-[#5b84c0] hover:scale-[1.01] active:scale-[0.99]'
                : 'bg-gray-600/50 text-white/50 cursor-not-allowed'
            }"
          >
            <span>Continue to Installations</span>
            <ArrowRight class="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  </div>
</div>

<AddressDialog
  isOpen={isAddDialogOpen}
  onClose={() => (isAddDialogOpen = false)}
  onSuccess={handleAddressAdded}
/>
