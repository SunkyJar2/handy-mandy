<script lang="ts">
  import type { PageData } from './$types';
  import { formatIdr } from '$lib/shared/pricing';
  import { MapPin, Calendar, Clock, UserCheck, Wrench, ArrowRight, ShieldCheck } from 'lucide-svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  function formatDate(iso: string | null): string {
    if (!iso) return 'Pending Confirmation';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  }
</script>

<svelte:head>
  <title>Order #{data.order.orderNumber} — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1240px] mx-auto px-6 py-10 space-y-8">
  <!-- Page Header matching Figma #93:203 -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="font-['Outfit'] font-bold text-3xl sm:text-[40px] text-[#CFF2FF] leading-tight">
        Order Details
      </h1>
      <p class="font-['Outfit'] text-base text-[#CFF2FF]/80 mt-1">
        Booking reference and scheduled installation overview
      </p>
    </div>
    <a
      href="/bookings"
      class="text-[#CFF2FF] hover:text-white underline text-sm sm:text-base font-['Outfit']"
    >
      ← Back to My Bookings
    </a>
  </div>

  <!-- Top Order Info Card matching Figma frame #93:240: 1182x322, radius 40px -->
  <div
    class="rounded-[30px] sm:rounded-[40px] p-6 sm:p-10 border border-[#1A3551] shadow-2xl backdrop-blur-md space-y-6"
    style="background: rgba(26, 53, 81, 0.5);"
  >
    <!-- Order Number and Placed on row -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="font-['Outfit'] font-medium text-2xl sm:text-[36px] text-[#CFF2FF] leading-none">
          Order #{data.order.orderNumber}
        </h2>
        <div class="text-sm sm:text-base text-[#B6C4D3] font-['Outfit'] mt-1">
          Placed on {formatDate(data.order.createdAt)}
        </div>
      </div>

      <div class="px-4 py-1.5 rounded-full bg-[#151447] border border-[#4A6FA5]/40 text-sm font-semibold text-[#25ED82] flex items-center gap-2">
        <ShieldCheck class="w-4 h-4" />
        <span>Paid & Verified</span>
      </div>
    </div>

    <!-- Technician Status Bar (Figma 93:217 / 93:219 / 93:211) -->
    <div
      class="p-4 sm:p-5 rounded-2xl border border-[#4A6FA5]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
      style="background: #4A6FA5;"
    >
      <div class="flex items-center gap-3">
        {#if data.order.technician}
          <UserCheck class="w-6 h-6 text-white shrink-0" />
          <div>
            <div class="text-xs uppercase font-bold tracking-wider text-[#CFF2FF]/90">Assigned Technician</div>
            <div class="text-lg font-bold text-white">
              {data.order.technician.fullName} ({data.order.technician.city})
            </div>
          </div>
        {:else}
          <Clock class="w-6 h-6 text-white shrink-0" />
          <div>
            <div class="text-xs uppercase font-bold tracking-wider text-[#CFF2FF]/90">Technician Status</div>
            <div class="text-lg font-bold text-white">Pending Assignment</div>
          </div>
        {/if}
      </div>

      {#if !data.order.technician}
        <a
          href="/technicians?orderId={data.order.id}"
          class="px-5 py-2 rounded-xl bg-white text-[#1A3551] font-semibold text-sm hover:bg-[#CFF2FF] transition-all shadow flex items-center justify-center gap-2"
        >
          <span>Choose Technician</span>
          <ArrowRight class="w-4 h-4" />
        </a>
      {/if}
    </div>

    <!-- Details Grid: Address & Estimated Finish (Figma 93:213 / 93:214) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#CFF2FF]/10 font-['Outfit']">
      <!-- Address (fixed binding from snapshot) -->
      <div class="space-y-1.5">
        <div class="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#8CAAB5]">
          <MapPin class="w-4 h-4 text-[#4A6FA5]" />
          <span>Installation Address</span>
        </div>
        <p class="text-base sm:text-lg text-white font-medium">
          {data.order.address.addressLine}
        </p>
        <p class="text-sm text-[#CFF2FF]/85">
          {data.order.address.district}, {data.order.address.city}, {data.order.address.postalCode}
        </p>
        {#if data.order.address.notes}
          <p class="text-xs text-[#8CAAB5] italic">
            Note: {data.order.address.notes}
          </p>
        {/if}
      </div>

      <!-- Estimated Finish Date -->
      <div class="space-y-1.5 md:text-right">
        <div class="flex items-center md:justify-end gap-2 text-xs uppercase font-bold tracking-wider text-[#8CAAB5]">
          <Calendar class="w-4 h-4 text-[#4A6FA5]" />
          <span>Estimated Finish</span>
        </div>
        <div class="text-xl sm:text-2xl font-bold text-[#25ED82]">
          {formatDate(data.order.estimatedFinishDate)}
        </div>
        {#if data.order.preferredDate}
          <p class="text-xs text-[#CFF2FF]/70">
            Preferred Visit: {formatDate(data.order.preferredDate)}
          </p>
        {/if}
      </div>
    </div>
  </div>

  <!-- Bottom Ordered Devices Card matching Figma #93:241: 1182x317, radius 40px -->
  <div
    class="rounded-[30px] sm:rounded-[40px] p-6 sm:p-10 border border-[#1A3551] shadow-2xl backdrop-blur-md space-y-6"
    style="background: rgba(26, 53, 81, 0.5);"
  >
    <h3 class="font-['Outfit'] font-medium text-2xl sm:text-[36px] text-[#CFF2FF] pb-2 border-b border-[#CFF2FF]/10">
      Ordered Devices & Services
    </h3>

    <!-- Line items list -->
    <div class="space-y-4 divide-y divide-[#CFF2FF]/10">
      {#each data.order.lines as line}
        <div class="pt-4 first:pt-0 flex items-center justify-between gap-4 font-['Outfit']">
          <div class="flex items-center gap-4">
            {#if line.imageUrl}
              <img
                src={line.imageUrl}
                alt={line.name}
                class="w-14 h-14 object-cover rounded-xl border border-[#CFF2FF]/20 bg-[#071824] shrink-0"
              />
            {:else}
              <div class="w-14 h-14 rounded-xl bg-[#4A6FA5]/30 border border-[#CFF2FF]/20 flex items-center justify-center shrink-0">
                <Wrench class="w-6 h-6 text-[#CFF2FF]" />
              </div>
            {/if}

            <div>
              <div class="font-medium text-base sm:text-lg text-white">
                {line.name}
              </div>
              <div class="text-xs text-[#8CAAB5]">
                {line.quantity} × {formatIdr(line.unitPriceIdr)}
              </div>
            </div>
          </div>

          <div class="font-bold text-base sm:text-lg text-white">
            {formatIdr(line.lineTotalIdr)}
          </div>
        </div>
      {/each}
    </div>

    <!-- Divider and Total Price (Figma 93:255 / 93:249 / 93:247) -->
    <div class="pt-6 border-t border-[#CFF2FF]/20 flex items-center justify-between font-['Outfit']">
      <span class="font-medium text-xl sm:text-2xl text-[#CFF2FF]">Total Price</span>
      <span class="font-extrabold text-2xl sm:text-3xl text-[#25ED82]">
        {formatIdr(data.order.totalIdr)}
      </span>
    </div>
  </div>
</div>
