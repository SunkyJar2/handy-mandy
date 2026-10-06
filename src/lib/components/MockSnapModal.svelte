<script lang="ts">
  import { formatIdr } from '$lib/shared/pricing';
  import { X, ShieldCheck, QrCode, CreditCard, Building2, Loader2, CheckCircle, AlertTriangle } from 'lucide-svelte';

  interface Props {
    isOpen: boolean;
    orderId: string;
    orderNumber: string;
    totalAmountIdr: number;
    onClose: () => void;
  }

  let { isOpen, orderId, orderNumber, totalAmountIdr, onClose }: Props = $props();

  let selectedMethod = $state<'qris' | 'va' | 'card'>('qris');
  let isProcessing = $state(false);
  let errorMessage = $state('');

  async function handleSimulateSuccess() {
    isProcessing = true;
    errorMessage = '';

    try {
      const res = await fetch('/api/v1/payments/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      const data = await res.json();
      if (!res.ok) {
        errorMessage = data.error?.message || 'Payment simulation failed.';
        isProcessing = false;
      } else {
        window.location.href = data.redirectUrl;
      }
    } catch {
      errorMessage = 'Network error during payment.';
      isProcessing = false;
    }
  }

  function handleSimulateFailure() {
    errorMessage = 'Simulated: Card was declined or transaction timed out.';
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    onclick={onClose}
  >
    <div
      class="relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-[#0d1d30] border border-[#4A6FA5]/60 shadow-2xl text-white transition-all animate-in zoom-in-95 duration-200"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Snap Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-[#CFF2FF]/10">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-[#4A6FA5] flex items-center justify-center">
            <ShieldCheck class="w-5 h-5 text-white" />
          </div>
          <div>
            <div class="font-['Outfit'] font-bold text-lg text-white">Handy Mandy Pay</div>
            <div class="text-[11px] text-[#25ED82] font-medium tracking-wide">SECURE SANDBOX GATEWAY</div>
          </div>
        </div>
        <button
          onclick={onClose}
          class="text-[#CFF2FF]/70 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close payment modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Order Summary Card inside modal -->
      <div class="my-5 p-4 rounded-xl bg-[#1A3551]/60 border border-[#CFF2FF]/10 space-y-1">
        <div class="flex items-center justify-between text-xs text-[#8CAAB5]">
          <span>Order Number</span>
          <span class="font-mono text-white">{orderNumber}</span>
        </div>
        <div class="flex items-center justify-between font-['Outfit'] pt-1">
          <span class="text-sm text-[#CFF2FF]">Total Payment</span>
          <span class="text-xl font-extrabold text-[#25ED82]">{formatIdr(totalAmountIdr)}</span>
        </div>
      </div>

      {#if errorMessage}
        <div class="mb-4 p-3 rounded-xl bg-[#FF6D6F]/10 border border-[#FF6D6F]/40 text-[#FF6D6F] text-xs font-medium flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      {/if}

      <!-- Payment Methods -->
      <div class="space-y-2 mb-6">
        <div class="text-xs font-semibold uppercase tracking-wider text-[#8CAAB5] mb-1">
          Select Simulated Method
        </div>

        <!-- QRIS -->
        <button
          type="button"
          onclick={() => (selectedMethod = 'qris')}
          class="w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left {
            selectedMethod === 'qris'
              ? 'border-[#CFF2FF] bg-[#1A3551] ring-1 ring-[#CFF2FF]/50'
              : 'border-[#1A3551] bg-[#071824]/60 hover:bg-[#1A3551]/40'
          }"
        >
          <div class="flex items-center gap-3">
            <QrCode class="w-5 h-5 text-[#25ED82]" />
            <div>
              <div class="text-sm font-semibold text-white">QRIS Instant Pay</div>
              <div class="text-xs text-[#8CAAB5]">GoPay, ShopeePay, BCA, OVO</div>
            </div>
          </div>
          {#if selectedMethod === 'qris'}
            <CheckCircle class="w-4 h-4 text-[#25ED82]" />
          {/if}
        </button>

        <!-- Virtual Account -->
        <button
          type="button"
          onclick={() => (selectedMethod = 'va')}
          class="w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left {
            selectedMethod === 'va'
              ? 'border-[#CFF2FF] bg-[#1A3551] ring-1 ring-[#CFF2FF]/50'
              : 'border-[#1A3551] bg-[#071824]/60 hover:bg-[#1A3551]/40'
          }"
        >
          <div class="flex items-center gap-3">
            <Building2 class="w-5 h-5 text-[#4A6FA5]" />
            <div>
              <div class="text-sm font-semibold text-white">Virtual Account (VA)</div>
              <div class="text-xs text-[#8CAAB5]">BCA, Mandiri, BRI, BNI</div>
            </div>
          </div>
          {#if selectedMethod === 'va'}
            <CheckCircle class="w-4 h-4 text-[#25ED82]" />
          {/if}
        </button>

        <!-- Credit Card -->
        <button
          type="button"
          onclick={() => (selectedMethod = 'card')}
          class="w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left {
            selectedMethod === 'card'
              ? 'border-[#CFF2FF] bg-[#1A3551] ring-1 ring-[#CFF2FF]/50'
              : 'border-[#1A3551] bg-[#071824]/60 hover:bg-[#1A3551]/40'
          }"
        >
          <div class="flex items-center gap-3">
            <CreditCard class="w-5 h-5 text-[#CFF2FF]" />
            <div>
              <div class="text-sm font-semibold text-white">Credit / Debit Card</div>
              <div class="text-xs text-[#8CAAB5]">Visa, Mastercard, JCB</div>
            </div>
          </div>
          {#if selectedMethod === 'card'}
            <CheckCircle class="w-4 h-4 text-[#25ED82]" />
          {/if}
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-2">
        <button
          type="button"
          disabled={isProcessing}
          onclick={handleSimulateSuccess}
          class="w-full h-12 rounded-xl bg-[#25ED82] hover:bg-[#34f88f] text-[#071824] font-['Outfit'] font-bold text-base transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {#if isProcessing}
            <Loader2 class="w-5 h-5 animate-spin" />
            <span>Processing Payment...</span>
          {:else}
            <span>Simulate Successful Payment</span>
          {/if}
        </button>

        <button
          type="button"
          disabled={isProcessing}
          onclick={handleSimulateFailure}
          class="w-full h-9 rounded-xl border border-[#FF6D6F]/30 text-[#FF6D6F] text-xs font-semibold hover:bg-[#FF6D6F]/10 transition-colors"
        >
          Simulate Payment Failure
        </button>
      </div>
    </div>
  </div>
{/if}
