<script lang="ts">
  import { X, Loader2 } from 'lucide-svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newAddress: any) => void;
  }

  let { isOpen, onClose, onSuccess }: Props = $props();

  let province = $state('Jawa Timur');
  let city = $state('Surabaya');
  let district = $state('');
  let addressLine = $state('');
  let postalCode = $state('');
  let notes = $state('');
  let isSubmitting = $state(false);
  let errorMessage = $state('');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errorMessage = '';
    isSubmitting = true;

    try {
      const res = await fetch('/api/v1/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          city,
          district,
          addressLine,
          postalCode,
          notes: notes.trim() || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        errorMessage = data.error?.message || 'Failed to save address.';
      } else {
        onSuccess(data.address);
        onClose();
      }
    } catch {
      errorMessage = 'Network error saving address.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    onclick={onClose}
  >
    <div
      class="relative w-full max-w-lg rounded-2xl p-6 sm:p-8 border border-[#4A6FA5]/40 shadow-2xl backdrop-blur-md transition-all animate-in zoom-in-95 duration-200"
      style="background: #1A3551;"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center justify-between pb-4 border-b border-[#CFF2FF]/10 mb-6">
        <h2 class="font-['Outfit'] font-bold text-2xl text-[#CFF2FF]">
          Add New Installation Address
        </h2>
        <button
          onclick={onClose}
          class="text-[#CFF2FF]/70 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      {#if errorMessage}
        <div class="mb-4 p-3 rounded-lg bg-[#FF6D6F]/10 border border-[#FF6D6F]/40 text-[#FF6D6F] text-sm">
          {errorMessage}
        </div>
      {/if}

      <form onsubmit={handleSubmit} class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="addr-prov" class="block font-['Outfit'] text-xs font-semibold uppercase tracking-wider text-[#8CAAB5] mb-1">
              Province
            </label>
            <input
              id="addr-prov"
              bind:value={province}
              type="text"
              required
              class="w-full h-10 px-3 rounded-lg bg-[#071824]/80 border border-[#CFF2FF]/30 text-white text-sm focus:outline-none focus:border-[#CFF2FF]"
            />
          </div>
          <div>
            <label for="addr-city" class="block font-['Outfit'] text-xs font-semibold uppercase tracking-wider text-[#8CAAB5] mb-1">
              City (Surabaya only)
            </label>
            <input
              id="addr-city"
              bind:value={city}
              type="text"
              required
              class="w-full h-10 px-3 rounded-lg bg-[#071824]/80 border border-[#CFF2FF]/30 text-white text-sm focus:outline-none focus:border-[#CFF2FF]"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="addr-dist" class="block font-['Outfit'] text-xs font-semibold uppercase tracking-wider text-[#8CAAB5] mb-1">
              District (Kecamatan)
            </label>
            <input
              id="addr-dist"
              bind:value={district}
              type="text"
              required
              placeholder="e.g. Kec Rungkut"
              class="w-full h-10 px-3 rounded-lg bg-[#071824]/80 border border-[#CFF2FF]/30 text-white text-sm focus:outline-none focus:border-[#CFF2FF]"
            />
          </div>
          <div>
            <label for="addr-post" class="block font-['Outfit'] text-xs font-semibold uppercase tracking-wider text-[#8CAAB5] mb-1">
              Postal Code
            </label>
            <input
              id="addr-post"
              bind:value={postalCode}
              type="text"
              required
              placeholder="60872"
              pattern="^[0-9]&#123;5&#125;$"
              class="w-full h-10 px-3 rounded-lg bg-[#071824]/80 border border-[#CFF2FF]/30 text-white text-sm focus:outline-none focus:border-[#CFF2FF]"
            />
          </div>
        </div>

        <div>
          <label for="addr-line" class="block font-['Outfit'] text-xs font-semibold uppercase tracking-wider text-[#8CAAB5] mb-1">
            Street Address / House / Unit
          </label>
          <input
            id="addr-line"
            bind:value={addressLine}
            type="text"
            required
            placeholder="e.g. Gang Menanggal Harapan VII No. 12"
            class="w-full h-10 px-3 rounded-lg bg-[#071824]/80 border border-[#CFF2FF]/30 text-white text-sm focus:outline-none focus:border-[#CFF2FF]"
          />
        </div>

        <div>
          <label for="addr-notes" class="block font-['Outfit'] text-xs font-semibold uppercase tracking-wider text-[#8CAAB5] mb-1">
            Notes / Landmark (optional)
          </label>
          <input
            id="addr-notes"
            bind:value={notes}
            type="text"
            placeholder="Near the white gate, call upon arrival"
            class="w-full h-10 px-3 rounded-lg bg-[#071824]/80 border border-[#CFF2FF]/30 text-white text-sm focus:outline-none focus:border-[#CFF2FF]"
          />
        </div>

        <div class="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onclick={onClose}
            class="px-4 py-2 rounded-lg border border-[#CFF2FF]/30 text-sm text-[#CFF2FF] hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            class="px-6 py-2 rounded-lg bg-[#4A6FA5] hover:bg-[#5b84c0] text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {#if isSubmitting}
              <Loader2 class="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            {:else}
              <span>Save Address</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
