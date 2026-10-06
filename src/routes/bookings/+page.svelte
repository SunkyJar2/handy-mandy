<script lang="ts">
  import type { PageData } from './$types';
  import { formatIdr } from '$lib/shared/pricing';
  import { Calendar, ArrowRight, UserCheck, Clock, CheckCircle } from 'lucide-svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  function formatDate(iso: string): string {
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

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING_ASSIGNMENT':
        return 'Pending Assignment';
      case 'ASSIGNED':
        return 'Assigned';
      case 'SCHEDULED':
        return 'Scheduled';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }
</script>

<svelte:head>
  <title>My Bookings — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1240px] mx-auto px-6 py-10 space-y-8">
  <!-- Page Header matching Figma #60:75 -->
  <div>
    <h1 class="font-['Outfit'] font-bold text-3xl sm:text-[40px] text-[#CFF2FF] leading-tight">
      My Bookings
    </h1>
    <p class="font-['Outfit'] text-base text-[#CFF2FF]/80 mt-1">
      Track installation schedules, technician assignments, and service history.
    </p>
  </div>

  {#if data.orders.length === 0}
    <!-- Empty Bookings State matching Figma #36:19 -->
    <div
      class="w-full rounded-[40px] p-12 sm:p-20 text-center flex flex-col items-center justify-center border border-[#1A3551] shadow-2xl backdrop-blur-md"
      style="background: rgba(26, 53, 81, 0.5);"
    >
      <div
        class="w-20 h-20 rounded-full border-2 border-[#CFF2FF]/40 flex items-center justify-center mb-6 shadow-inner"
        style="background: rgba(74, 111, 165, 0.2);"
      >
        <Calendar class="w-10 h-10 text-[#CFF2FF]" />
      </div>

      <h2 class="font-['Outfit'] font-bold text-2xl sm:text-3xl text-[#CFF2FF] mb-3">
        No bookings found
      </h2>
      <p class="font-['Outfit'] text-base text-[#CFF2FF]/80 max-w-md mb-8">
        You haven't made any bookings yet.
      </p>

      <a
        href="/catalog"
        class="inline-flex items-center justify-center h-[48px] px-8 rounded-[15px] font-['Outfit'] font-semibold text-lg text-white hover:brightness-110 transition-all shadow-lg hover:scale-105"
        style="background: #4A6FA5;"
      >
        Browse Catalog
      </a>
    </div>
  {:else}
    <!-- Bookings Cards List matching Figma #60:136 -->
    <div class="space-y-6">
      {#each data.orders as order (order.id)}
        <div
          class="rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 border border-[#1A3551] shadow-2xl backdrop-blur-md space-y-5 transition-all hover:border-[#4A6FA5]/60"
          style="background: rgba(26, 53, 81, 0.5);"
        >
          <!-- Top Row: Order ID, Booked on, Status Pill, View Detail (Figma 60:185, 62:194, 65:203) -->
          <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#CFF2FF]/15">
            <div class="flex flex-wrap items-center gap-6 sm:gap-10">
              <div>
                <span class="text-xs text-[#8CAAB5] uppercase font-bold tracking-wider block">Order ID:</span>
                <span class="font-['Outfit'] font-semibold text-base sm:text-lg text-white font-mono">
                  {order.orderNumber}
                </span>
              </div>

              <div>
                <span class="text-xs text-[#8CAAB5] uppercase font-bold tracking-wider block">Booked on:</span>
                <span class="font-['Outfit'] text-sm sm:text-base text-[#CFF2FF]">
                  {formatDate(order.createdAt)}
                </span>
              </div>

              <!-- Status Pill (Figma 65:203) -->
              <div>
                <span class="text-xs text-[#8CAAB5] uppercase font-bold tracking-wider block">Status:</span>
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide {
                    order.status === 'PENDING_ASSIGNMENT'
                      ? 'bg-[#4A6FA5] text-white'
                      : order.status === 'ASSIGNED'
                      ? 'bg-[#25ED82]/20 border border-[#25ED82]/50 text-[#25ED82]'
                      : 'bg-[#151447] text-[#CFF2FF]'
                  }"
                >
                  {#if order.status === 'PENDING_ASSIGNMENT'}
                    <Clock class="w-3.5 h-3.5" />
                  {:else if order.status === 'ASSIGNED'}
                    <UserCheck class="w-3.5 h-3.5" />
                  {:else}
                    <CheckCircle class="w-3.5 h-3.5" />
                  {/if}
                  <span>{getStatusLabel(order.status)}</span>
                </span>
              </div>
            </div>

            <!-- View Detail Link (Figma 65:204) -->
            <a
              href="/bookings/{order.id}"
              class="font-['Outfit'] font-semibold text-base sm:text-lg text-[#CFF2FF] hover:text-white flex items-center gap-1.5 hover:underline transition-colors ml-auto sm:ml-0"
            >
              <span>View Detail</span>
              <ArrowRight class="w-4 h-4" />
            </a>
          </div>

          <!-- Bottom Row: Items, Technicians, Price (Figma 62:196, 65:199, 65:201) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start font-['Outfit']">
            <!-- Items Column -->
            <div class="space-y-1">
              <span class="text-xs text-[#8CAAB5] uppercase font-bold tracking-wider block">
                Items ({order.itemNames.length})
              </span>
              <div class="text-sm sm:text-base text-white font-medium line-clamp-2">
                {order.itemNames.join(', ') || 'Smart Home Hardware'}
              </div>
            </div>

            <!-- Technicians Column -->
            <div class="space-y-1">
              <span class="text-xs text-[#8CAAB5] uppercase font-bold tracking-wider block">
                Technicians
              </span>
              <div class="text-sm sm:text-base">
                {#if order.technician}
                  <span class="text-white font-semibold flex items-center gap-2">
                    <UserCheck class="w-4 h-4 text-[#25ED82]" />
                    <span>{order.technician.fullName}</span>
                  </span>
                {:else}
                  <a
                    href="/technicians?orderId={order.id}"
                    class="text-[#CFF2FF] underline hover:text-white font-medium flex items-center gap-1.5"
                  >
                    <span>Choose Technician</span>
                    <ArrowRight class="w-3.5 h-3.5" />
                  </a>
                {/if}
              </div>
            </div>

            <!-- Price Column -->
            <div class="space-y-1 md:text-right">
              <span class="text-xs text-[#8CAAB5] uppercase font-bold tracking-wider block">
                Total Price
              </span>
              <div class="font-extrabold text-xl sm:text-2xl text-[#25ED82]">
                {formatIdr(order.totalIdr)}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
