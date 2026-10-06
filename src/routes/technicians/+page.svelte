<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { Star, MapPin, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let assigningTechId = $state<string | null>(null);
</script>

<svelte:head>
  <title>Technicians — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1320px] mx-auto px-6 py-10 space-y-6">
  <!-- Page Header matching Figma #78:52 / #78:53 -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="font-['Outfit'] font-bold text-3xl sm:text-[40px] text-[#CFF2FF] leading-tight">
        Technicians
      </h1>
      <p class="font-['Outfit'] text-base text-[#CFF2FF]/80 mt-1">
        Choose the technician to install your hardware.
      </p>
    </div>

    {#if data.targetOrder}
      <div class="px-4 py-2 rounded-xl bg-[#4A6FA5]/30 border border-[#CFF2FF]/20 text-xs sm:text-sm font-['Outfit'] flex items-center gap-2">
        <Info class="w-4 h-4 text-[#25ED82]" />
        <span>Assigning to Booking <span class="font-mono font-bold text-white">{data.targetOrder.orderNumber}</span></span>
      </div>
    {/if}
  </div>

  <!-- Technicians Main Panel matching Figma frame #78:26 (width 1275, radius 40px) -->
  <div
    class="w-full rounded-[40px] p-6 sm:p-10 border-4 border-[#1A3551] shadow-2xl backdrop-blur-md space-y-6"
    style="background: rgba(26, 53, 81, 0.92);"
  >
    <!-- Searching for title (Figma #82:44: Outfit Bold 40px) -->
    <div class="pb-2 border-b border-[#CFF2FF]/10">
      <h2 class="font-['Outfit'] font-bold text-2xl sm:text-4xl text-[#CFF2FF]">
        Searching for : Surabaya
      </h2>
    </div>

    <!-- Technician Rows List (Figma 168:32, 168:34, 168:36) -->
    <div class="space-y-4">
      {#each data.technicians as tech (tech.id)}
        {@const isAvailable = tech.availability === 'AVAILABLE'}
        <div
          class="relative rounded-[30px] p-5 sm:p-6 border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 {
            isAvailable
              ? 'border-[#CFF2FF]/10 bg-[#006AD7]/20 hover:bg-[#006AD7]/30 hover:border-[#CFF2FF]/30'
              : 'border-[#1A3551] bg-[#071824]/40 opacity-60'
          }"
        >
          <!-- Left: Avatar + Details -->
          <div class="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
            <!-- Avatar (Figma 82:30, 82:33: 66x66 / 81x81) -->
            <img
              src={tech.avatarUrl || '/images/tech-thaariq.png'}
              alt={tech.fullName}
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#CFF2FF]/30 bg-[#071824] shrink-0"
            />

            <!-- Info -->
            <div class="space-y-1 min-w-0 font-['Outfit']">
              <div class="flex flex-wrap items-center gap-2.5">
                <h3 class="font-bold text-xl sm:text-2xl text-[#CFF2FF] truncate">
                  {tech.fullName}
                </h3>

                {#if !isAvailable}
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF6D6F]/20 text-[#FF6D6F] border border-[#FF6D6F]/30">
                    Unavailable
                  </span>
                {/if}
              </div>

              <!-- Rating and areas row -->
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

          <!-- Right: Assign Action Button matching Figma #82:40 / #82:42 (166x26 fill #4A6FA5) -->
          <div class="shrink-0 flex items-center md:justify-end">
            {#if !isAvailable}
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
  </div>
</div>
