<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';
  import SearchPill from '$lib/components/SearchPill.svelte';
  import { filterTechniciansByLocation } from '$lib/shared/cart-selection';
  import { formatSavedAddressSummary } from '$lib/shared/address';
  import { Star, MapPin, CheckCircle, Info, Loader2, PlusSquare, Minus, Check } from 'lucide-svelte';
  import { slide } from 'svelte/transition';

  interface Props {
    data: PageData;
    form?: ActionData;
  }

  let { data, form }: Props = $props();

  let locationQuery = $state('');
  let assigningTechId = $state<string | null>(null);

  // Saved Address quick-add state
  let isAddingAddress = $state(false);
  let quickName = $state('');
  let quickAddress = $state('');
  let isSavingAddress = $state(false);
  let selectedAddressId = $state<string | null>(null);

  let filteredTechnicians = $derived(filterTechniciansByLocation(data.technicians, locationQuery));

  function selectAddressToFilter(addr: { id: string; district: string }) {
    if (selectedAddressId === addr.id) {
      selectedAddressId = null;
      locationQuery = '';
    } else {
      selectedAddressId = addr.id;
      locationQuery = addr.district;
    }
  }
</script>

<svelte:head>
  <title>Technicians — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
  {#if form?.message}
    <div class="p-4 rounded-2xl bg-[#FF6D6F]/10 border border-[#FF6D6F]/40 text-[#FF6D6F] text-sm font-medium">
      {form.message}
    </div>
  {/if}

  <!-- Page Header matching Figma #78:52 / #78:53 -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="font-['Outfit'] font-bold text-3xl sm:text-[40px] text-[#CFF2FF] leading-tight">
        Technicians
      </h1>
      <p class="font-['Outfit'] text-sm sm:text-base text-[#CFF2FF]/80 mt-1">
        Choose certified Surabaya technicians to install your smart home hardware.
      </p>
    </div>

    {#if data.targetOrder}
      <div class="px-4 py-2 rounded-xl bg-[#4A6FA5]/30 border border-[#CFF2FF]/20 text-xs sm:text-sm font-['Outfit'] flex items-center gap-2 shrink-0">
        <Info class="w-4 h-4 text-[#25ED82]" />
        <span>Assigning to Booking <span class="font-mono font-bold text-white">{data.targetOrder.orderNumber}</span></span>
      </div>
    {/if}
  </div>

  <!-- Technicians Main Panel matching Figma frame #78:26 & #222:430 (rounded 40px, bg 26,53,81, 0.92) -->
  <div
    class="w-full rounded-[30px] sm:rounded-[40px] p-6 sm:p-10 border-2 sm:border-4 border-[#1A3551] shadow-2xl backdrop-blur-md"
    style="background: rgba(26, 53, 81, 0.92);"
  >
    <!-- 2-Column Split matching Figma #222:430 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column (lg:col-span-8): Location Header + Search + Technician List -->
      <div class="lg:col-span-8 space-y-6">
        <!-- Location Heading + Search Pill matching Figma #82:44 + #220:295 / #222:493 -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#CFF2FF]/15">
          <h2 class="font-['Outfit'] font-bold text-2xl sm:text-4xl text-[#CFF2FF]">
            Location
          </h2>

          <SearchPill
            bind:value={locationQuery}
            placeholder="Search area (e.g. Menanggal)"
            class="sm:w-[320px] md:w-[380px]"
          />
        </div>

        {#if selectedAddressId}
          <div class="flex items-center justify-between text-xs text-[#8CAAB5] bg-[#006AD7]/15 px-4 py-2 rounded-xl border border-[#CFF2FF]/20">
            <span>Filtering technicians for selected address district: <strong class="text-white">{locationQuery}</strong></span>
            <button
              type="button"
              onclick={() => { selectedAddressId = null; locationQuery = ''; }}
              class="text-[#CFF2FF] underline hover:text-white"
            >
              Reset filter
            </button>
          </div>
        {/if}

        <!-- Technician Cards List matching Figma 168:32, 168:34, 168:36 / #222:450 -->
        {#if filteredTechnicians.length === 0}
          <div class="py-16 text-center text-[#8CAAB5] bg-[#071824]/40 rounded-2xl border border-white/10 p-6">
            No technicians found matching "{locationQuery}". Try searching another Surabaya district.
          </div>
        {:else}
          <div class="space-y-4">
            {#each filteredTechnicians as tech (tech.id)}
              {@const isAvailable = tech.availability === 'AVAILABLE'}
              {@const isAssignedToUser = data.assignedTechnicianIds.includes(tech.id)}

              <div
                class="relative rounded-[24px] sm:rounded-[30px] p-5 sm:p-6 border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 {
                  isAssignedToUser
                    ? 'border-[#25ED82]/40 bg-[#006AD7]/30 ring-1 ring-[#25ED82]/30'
                    : isAvailable
                    ? 'border-[#CFF2FF]/15 bg-[#006AD7]/20 hover:bg-[#006AD7]/30 hover:border-[#CFF2FF]/30'
                    : 'border-[#1A3551] bg-[#071824]/40 opacity-60'
                }"
              >
                <!-- Left: Avatar + Details -->
                <div class="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
                  <img
                    src={tech.avatarUrl || '/images/tech-thaariq.png'}
                    alt={tech.fullName}
                    class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#CFF2FF]/30 bg-[#071824] shrink-0"
                  />

                  <div class="space-y-1 min-w-0 font-['Outfit']">
                    <div class="flex flex-wrap items-center gap-2.5">
                      <h3 class="font-bold text-xl sm:text-2xl text-[#CFF2FF] truncate">
                        {tech.fullName}
                      </h3>

                      {#if !isAvailable && !isAssignedToUser}
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF6D6F]/20 text-[#FF6D6F] border border-[#FF6D6F]/30">
                          Unavailable
                        </span>
                      {/if}
                    </div>

                    <!-- Rating and Areas row -->
                    <div class="flex flex-wrap items-center gap-4 text-sm text-[#CFF2FF]/85">
                      <div class="flex items-center gap-1.5 font-medium">
                        <Star class="w-4 h-4 fill-[#25ED82] text-[#25ED82]" />
                        <span>{tech.ratingAvg} stars</span>
                        <span class="text-xs text-[#8CAAB5]">({tech.ratingCount} reviews)</span>
                      </div>

                      <div class="flex items-center gap-1 text-[#CFF2FF]/70">
                        <MapPin class="w-3.5 h-3.5 text-[#4A6FA5]" />
                        <span>{tech.areas.join(' · ') || 'Surabaya Central'}</span>
                      </div>
                    </div>

                    <!-- Highlight note matching Figma 82:58 -->
                    {#if tech.highlight}
                      <div class="text-xs text-[#8CAAB5] italic pt-0.5">
                        "{tech.highlight}"
                      </div>
                    {/if}
                  </div>
                </div>

                <!-- Right Action Pill matching Figma #82:40 or #222:499 (Assigned / In Progress...) -->
                <div class="shrink-0 flex items-center md:justify-end">
                  {#if isAssignedToUser}
                    <!-- Assigned / In Progress Status Pill matching Figma #222:499 + #266:553 -->
                    <div
                      class="w-[166px] h-11 rounded-[15px] border border-[#CFF2FF]/20 bg-[#071824]/60 flex flex-col items-center justify-center text-center shadow"
                    >
                      <div class="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Check class="w-3.5 h-3.5 text-[#25ED82] stroke-[3]" />
                        <span>Assigned</span>
                      </div>
                      <span class="text-[11px] text-[#9FA2A7] leading-none">In Progress...</span>
                    </div>
                  {:else if !isAvailable}
                    <div class="text-xs text-[#8CAAB5] italic">Currently booked</div>
                  {:else if data.targetOrder}
                    <form
                      method="POST"
                      action="?/assign"
                      use:enhance={() => {
                        assigningTechId = tech.id;
                        return async ({ update }) => {
                          assigningTechId = null;
                          await update();
                        };
                      }}
                    >
                      <input type="hidden" name="orderId" value={data.targetOrder.id} />
                      <input type="hidden" name="technicianId" value={tech.id} />
                      <button
                        type="submit"
                        disabled={assigningTechId === tech.id}
                        class="w-[166px] h-10 rounded-[15px] font-['Outfit'] font-semibold text-sm text-white transition-all shadow-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 disabled:opacity-50"
                        style="background: #4A6FA5;"
                      >
                        {#if assigningTechId === tech.id}
                          <Loader2 class="w-4 h-4 animate-spin" />
                          <span>Assigning...</span>
                        {:else}
                          <CheckCircle class="w-4 h-4" />
                          <span>Assign</span>
                        {/if}
                      </button>
                    </form>
                  {:else}
                    <span class="text-xs text-[#8CAAB5]">
                      Book via checkout to assign
                    </span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Right Column (lg:col-span-4): "Saved Address" Sidebar matching Figma #222:447 -->
      <aside aria-label="Saved addresses" class="lg:col-span-4 space-y-4">
        <!-- Saved Address Header Pill matching Figma #222:447 -->
        <div
          class="h-[52px] px-5 rounded-[24px] border border-[#4C527D]/60 flex items-center justify-between shadow"
          style="background: rgba(21, 20, 71, 0.65);"
        >
          <div class="flex items-center gap-2.5">
            <MapPin class="w-5 h-5 text-[#4A6FA5]" />
            <span class="font-['Outfit'] font-medium text-lg sm:text-xl text-[#CFF2FF]">
              Saved Address
            </span>
          </div>

          <!-- Add / Collapse Toggle button matching Figma #220:308 / #222:519 -->
          <button
            type="button"
            onclick={() => (isAddingAddress = !isAddingAddress)}
            class="text-[#CFF2FF] hover:text-white p-1 rounded-lg transition-transform active:scale-95"
            aria-label={isAddingAddress ? 'Cancel adding address' : 'Add saved address'}
          >
            {#if isAddingAddress}
              <Minus class="w-5 h-5" />
            {:else}
              <PlusSquare class="w-5 h-5" />
            {/if}
          </button>
        </div>

        <!-- Inline Quick-Add Address Card matching Figma #222:516..539 -->
        {#if isAddingAddress}
          <div
            transition:slide={{ duration: 200 }}
            class="rounded-[24px] p-5 border border-[#CFF2FF]/25 shadow-lg space-y-3"
            style="background: rgba(0, 106, 215, 0.15);"
          >
            <form
              method="POST"
              action="?/saveQuickAddress"
              use:enhance={() => {
                isSavingAddress = true;
                return async ({ result, update }) => {
                  isSavingAddress = false;
                  if (result.type === 'success') {
                    isAddingAddress = false;
                    quickName = '';
                    quickAddress = '';
                  }
                  await update();
                };
              }}
              class="space-y-3 font-['Outfit']"
            >
              <!-- Name Input with bottom line matching Figma #222:517 + #222:521 -->
              <div>
                <input
                  type="text"
                  name="label"
                  bind:value={quickName}
                  placeholder="Name (e.g. Home, School)"
                  required
                  class="w-full bg-transparent text-white placeholder-[#CFF2FF]/40 text-sm py-1 border-b border-[#CFF2FF]/40 focus:border-[#CFF2FF] focus:outline-none transition-colors"
                />
              </div>

              <!-- Address Input with bottom line matching Figma #222:523 + #222:524 -->
              <div>
                <input
                  type="text"
                  name="rawAddress"
                  bind:value={quickAddress}
                  placeholder="Input your address (e.g. Menanggal, Jl. Kembang Indah, 60267)"
                  required
                  class="w-full bg-transparent text-white placeholder-[#CFF2FF]/40 text-sm py-1 border-b border-[#CFF2FF]/40 focus:border-[#CFF2FF] focus:outline-none transition-colors"
                />
              </div>

              <!-- Action buttons matching Figma #222:530 (Cancel) & #222:537 (Save) -->
              <div class="flex items-center justify-end gap-4 pt-2">
                <button
                  type="button"
                  onclick={() => (isAddingAddress = false)}
                  class="text-xs text-[#CFF2FF]/80 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  class="text-xs font-semibold text-[#25ED82] hover:text-[#58ff9d] underline underline-offset-2 transition-colors disabled:opacity-50"
                >
                  {isSavingAddress ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        {/if}

        <!-- Saved Address Cards matching Figma #222:440..446 -->
        {#if data.addresses.length === 0}
          <div class="p-6 text-center text-xs text-[#8CAAB5] bg-[#071824]/40 rounded-[24px] border border-white/10">
            No saved addresses yet. Click <PlusSquare class="w-3.5 h-3.5 inline mx-1" /> above to quickly add Home or School.
          </div>
        {:else}
          <div class="space-y-3 font-['Outfit']">
            {#each data.addresses as addr (addr.id)}
              {@const isSelected = selectedAddressId === addr.id}
              {@const summary = formatSavedAddressSummary(addr)}

              <div
                class="relative rounded-[24px] p-4.5 border transition-all text-left group {
                  isSelected
                    ? 'border-[#00FBFF] ring-2 ring-[#00FBFF]/40 bg-[#006AD7]/30'
                    : 'border-[#CFF2FF]/20 bg-[#006AD7]/15 hover:bg-[#006AD7]/25 hover:border-[#CFF2FF]/35'
                }"
              >
                <button
                  type="button"
                  class="w-full text-left pr-8 space-y-1 focus:outline-none cursor-pointer"
                  onclick={() => selectAddressToFilter(addr)}
                >
                  <div class="font-bold text-lg text-white group-hover:text-[#CFF2FF] transition-colors flex items-center gap-2">
                    <span>{summary.title}</span>
                    {#if isSelected}
                      <span class="text-[10px] uppercase font-bold text-[#00FBFF] bg-[#00FBFF]/15 px-2 py-0.5 rounded-full">
                        Active filter
                      </span>
                    {/if}
                  </div>
                  <p class="text-xs text-[#CFF2FF]/80 leading-relaxed">
                    {summary.subtitle}
                  </p>
                </button>

                <!-- Delete (-) Button matching Figma #222:444 / #222:492 -->
                <form
                  method="POST"
                  action="?/deleteAddress"
                  use:enhance
                  class="absolute top-3.5 right-4 z-10"
                >
                  <input type="hidden" name="addressId" value={addr.id} />
                  <button
                    type="submit"
                    class="w-6 h-5 flex items-center justify-center text-[#B6C4D3] hover:text-[#FF6D6F] transition-colors p-1"
                    title="Delete address"
                    aria-label="Delete saved address {summary.title}"
                  >
                    <div class="w-4 h-0.5 bg-current rounded-sm"></div>
                  </button>
                </form>
              </div>
            {/each}
          </div>
        {/if}
      </aside>
    </div>
  </div>
</div>
