<script lang="ts">
  import type { PageData } from './$types';
  import CheckoutStepper from '$lib/components/CheckoutStepper.svelte';
  import { Check, Users, Calendar, ArrowRight } from 'lucide-svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Order Confirmed — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1480px] mx-auto px-6 py-8 space-y-12">
  <!-- Stepper: all 4 complete matching Figma frame 138:41 -->
  <CheckoutStepper currentStep={4} />

  <!-- Confirmation Card matching Figma frame #138:65: 917x314 -->
  <div class="flex justify-center">
    <div
      class="w-full max-w-[920px] rounded-[40px] p-8 sm:p-14 text-center border-2 border-[#CFF2FF]/50 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center space-y-6"
      style="background: rgba(26, 53, 81, 0.65);"
    >
      <!-- Big Checkmark Circle (Figma 158:37: 41x41 circle) -->
      <div
        class="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg text-[#1A3551] animate-in zoom-in"
      >
        <Check class="w-10 h-10 stroke-[3]" />
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
  </div>
</div>
