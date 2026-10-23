<script lang="ts">
  import type { PageData } from './$types';
  import CheckoutStepper from '$lib/components/CheckoutStepper.svelte';
  import { formatIdr } from '$lib/shared/pricing';
  import { Check, Users, Calendar, ArrowRight, ReceiptText } from 'lucide-svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Order Confirmed — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1480px] mx-auto px-6 py-8 space-y-10">
  <!-- Stepper: all 4 complete matching Figma frame 138:41 -->
  <CheckoutStepper currentStep={4} />

  <!-- Confirmation Card matching Figma frame #138:65: 917x314 -->
  <div class="flex flex-col items-center gap-8">
    <div
      class="w-full max-w-[920px] rounded-[40px] p-8 sm:p-14 text-center border-2 border-[#CFF2FF]/50 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center space-y-5"
      style="background: rgba(26, 53, 81, 0.65);"
    >
      <!-- Big Checkmark Circle (Figma 158:37: 41x41 circle) -->
      <div
        class="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg text-[#1A3551]"
      >
        <Check class="w-10 h-10 stroke-[3]" />
      </div>

      <!-- Badge matching Figma #158:42 -->
      <div class="inline-flex items-center px-4 py-1 rounded-full bg-[#25ED82]/15 border border-[#25ED82]/40 text-[#25ED82] text-xs font-extrabold tracking-[0.14em] uppercase">
        Payment & Booking Confirmed
      </div>

      <!-- Headline (Figma 138:99: Outfit Bold 48px) -->
      <h1 class="font-['Outfit'] font-bold text-3xl sm:text-5xl text-[#CFF2FF] leading-tight">
        Thank you for your order!
      </h1>

      <!-- Subtitle with Order Number (Figma 158:35: Outfit Regular 20px) -->
      <p class="font-['Outfit'] text-base sm:text-xl text-[#CFF2FF]/85 max-w-xl leading-relaxed">
        Order <span class="font-extrabold text-white font-mono tracking-wide">{data.order.orderNumber}</span> has been received and added to our installation dispatch queue.
      </p>

      <!-- Action Buttons -->
      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
        <a
          href="/technicians?orderId={data.order.id}"
          class="w-full sm:w-auto px-8 py-4 rounded-[15px] font-['Outfit'] font-semibold text-lg text-white shadow-xl transition-all flex items-center justify-center gap-2.5 bg-[#4A6FA5] hover:bg-[#5b84c0] hover:scale-105 active:scale-95"
        >
          <Users class="w-5 h-5" />
          <span>Choose Technician</span>
          <ArrowRight class="w-5 h-5 ml-1" />
        </a>

        <a
          href="/bookings/{data.order.id}"
          class="w-full sm:w-auto px-8 py-4 rounded-[15px] font-['Outfit'] font-semibold text-lg text-[#CFF2FF] border border-[#CFF2FF]/40 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          <Calendar class="w-5 h-5" />
          <span>View Booking Details</span>
        </a>
      </div>
    </div>

    <!-- Invoice Receipt Card matching Figma #158:45 / #176:32..54 -->
    {#if data.order.lines && data.order.lines.length > 0}
      <div
        class="w-full max-w-[920px] rounded-[40px] p-6 sm:p-10 border border-[#CFF2FF]/25 shadow-2xl backdrop-blur-md space-y-6"
        style="background: rgba(26, 53, 81, 0.60);"
      >
        <div class="flex items-center justify-between pb-4 border-b border-[#CFF2FF]/15">
          <div class="flex items-center gap-2.5">
            <ReceiptText class="w-6 h-6 text-[#4A6FA5]" />
            <h2 class="font-['Outfit'] font-bold text-xl sm:text-2xl text-[#CFF2FF]">
              Invoice Receipt
            </h2>
          </div>
          <span class="font-mono text-sm text-[#8CAAB5]">
            #{data.order.orderNumber}
          </span>
        </div>

        <div class="space-y-4">
          {#each data.order.lines as line (line.id)}
            <div class="flex items-start justify-between gap-4 font-['Outfit']">
              <div>
                <div class="font-semibold text-base sm:text-lg text-[#CFF2FF]">
                  {line.nameSnapshot}
                </div>
                {#if line.lineType === 'INSTALLATION'}
                  <div class="text-xs sm:text-sm text-[#8CAAB5]">
                    Full wiring & mounting warranty · {line.quantity} unit{line.quantity === 1 ? '' : 's'}
                  </div>
                {:else}
                  <div class="text-xs sm:text-sm text-[#8CAAB5] tabular-nums">
                    {line.quantity} × {formatIdr(line.unitPriceIdr)}
                  </div>
                {/if}
              </div>
              <div class="font-bold text-base sm:text-lg text-white tabular-nums shrink-0">
                {formatIdr(line.lineTotalIdr)}
              </div>
            </div>
          {/each}
        </div>

        <!-- Divider matching Figma #176:54 -->
        <div class="h-[2px] rounded-full bg-[#4A6FA5]/60 my-2"></div>

        <div class="flex items-center justify-between font-['Outfit'] pt-1">
          <span class="text-base sm:text-lg font-medium text-[#CFF2FF]">
            Total Paid (IDR)
          </span>
          <span class="font-extrabold text-2xl sm:text-3xl text-[#00FBFF] tabular-nums">
            {formatIdr(data.order.totalIdr)}
          </span>
        </div>
      </div>
    {/if}
  </div>
</div>
