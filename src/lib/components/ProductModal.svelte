<script lang="ts">
  import type { CategoryDto } from '$lib/shared/types';
  import { X, Loader2 } from 'lucide-svelte';

  interface Props {
    isOpen: boolean;
    categories: CategoryDto[];
    initialProduct?: any | null;
    onClose: () => void;
    onSuccess: () => void;
  }

  let { isOpen, categories, initialProduct = null, onClose, onSuccess }: Props = $props();

  let name = $state('');
  let description = $state('');
  let priceIdr = $state(150000);
  let categoryId = $state('');
  let imageUrl = $state('/images/product-hub.png');
  let isFeatured = $state(false);
  let isSubmitting = $state(false);
  let errorMessage = $state('');

  $effect(() => {
    if (initialProduct) {
      name = initialProduct.name;
      description = initialProduct.description;
      priceIdr = initialProduct.priceIdr;
      categoryId = initialProduct.categoryId;
      imageUrl = initialProduct.imageUrl;
      isFeatured = initialProduct.isFeatured;
    } else {
      name = '';
      description = '';
      priceIdr = 150000;
      categoryId = categories[0]?.id ?? '';
      imageUrl = '/images/product-hub.png';
      isFeatured = false;
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    isSubmitting = true;
    errorMessage = '';

    const url = initialProduct
      ? `/api/v1/admin/products/${initialProduct.id}`
      : '/api/v1/admin/products';

    const method = initialProduct ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          priceIdr: Number(priceIdr),
          categoryId,
          imageUrl,
          isFeatured
        })
      });

      const data = await res.json();
      if (!res.ok) {
        errorMessage = data.error?.message || 'Failed to save product.';
      } else {
        onSuccess();
        onClose();
      }
    } catch {
      errorMessage = 'Network error saving product.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    onclick={onClose}
  >
    <div
      class="relative w-full max-w-lg rounded-2xl p-6 sm:p-8 border border-[#4A6FA5]/40 shadow-2xl backdrop-blur-md"
      style="background: #1A3551;"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center justify-between pb-4 border-b border-[#CFF2FF]/10 mb-6">
        <h2 class="font-['Outfit'] font-bold text-2xl text-[#CFF2FF]">
          {initialProduct ? 'Edit Product' : 'Add New Product'}
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
        <div>
          <label for="prod-name" class="block font-['Outfit'] text-xs font-semibold uppercase tracking-wider text-[#8CAAB5] mb-1">
            Product Name
          </label>
          <input
            id="prod-name"
            bind:value={name}
            type="text"
            required
            placeholder="e.g. Smart LED Ceiling Light"
            class="w-full h-10 px-3 rounded-lg bg-[#071824]/80 border border-[#CFF2FF]/30 text-white text-sm focus:outline-none focus:border-[#CFF2FF]"
          />
        </div>

        <div>
          <label for="prod-desc" class="block font-['Outfit'] text-xs font-semibold uppercase tracking-wider text-[#8CAAB5] mb-1">
            Description
          </label>
          <textarea
            id="prod-desc"
            bind:value={description}
            rows="3"
            required
            placeholder="Short product overview and specifications"
            class="w-full p-3 rounded-lg bg-[#071824]/80 border border-[#CFF2FF]/30 text-white text-sm focus:outline-none focus:border-[#CFF2FF] resize-none"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="prod-price" class="block font-['Outfit'] text-xs font-semibold uppercase tracking-wider text-[#8CAAB5] mb-1">
              Price (IDR)
            </label>
            <input
              id="prod-price"
              bind:value={priceIdr}
              type="number"
              min="1000"
              step="1000"
              required
              class="w-full h-10 px-3 rounded-lg bg-[#071824]/80 border border-[#CFF2FF]/30 text-white text-sm focus:outline-none focus:border-[#CFF2FF]"
            />
          </div>

          <div>
            <label for="prod-cat" class="block font-['Outfit'] text-xs font-semibold uppercase tracking-wider text-[#8CAAB5] mb-1">
              Category
            </label>
            <select
              id="prod-cat"
              bind:value={categoryId}
              required
              class="w-full h-10 px-3 rounded-lg bg-[#071824]/80 border border-[#CFF2FF]/30 text-white text-sm focus:outline-none focus:border-[#CFF2FF]"
            >
              {#each categories as cat}
                <option value={cat.id}>{cat.name}</option>
              {/each}
            </select>
          </div>
        </div>

        <div>
          <label for="prod-img" class="block font-['Outfit'] text-xs font-semibold uppercase tracking-wider text-[#8CAAB5] mb-1">
            Image Path or URL
          </label>
          <div class="flex gap-2">
            <input
              id="prod-img"
              bind:value={imageUrl}
              type="text"
              required
              placeholder="/images/product-hub.png"
              class="flex-1 h-10 px-3 rounded-lg bg-[#071824]/80 border border-[#CFF2FF]/30 text-white text-sm focus:outline-none focus:border-[#CFF2FF]"
            />
          </div>
          <div class="flex gap-2 mt-2">
            <button
              type="button"
              onclick={() => (imageUrl = '/images/product-hub.png')}
              class="text-xs px-2 py-1 rounded bg-[#071824] text-[#CFF2FF]/80 hover:text-white"
            >
              Use Hub Image
            </button>
            <button
              type="button"
              onclick={() => (imageUrl = '/images/product-lock.png')}
              class="text-xs px-2 py-1 rounded bg-[#071824] text-[#CFF2FF]/80 hover:text-white"
            >
              Use Lock Image
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <input
            id="prod-feat"
            type="checkbox"
            bind:checked={isFeatured}
            class="w-4 h-4 rounded text-[#4A6FA5] focus:ring-0 bg-[#071824] border-[#CFF2FF]/40"
          />
          <label for="prod-feat" class="font-['Outfit'] text-sm text-[#CFF2FF]">
            Mark as Featured Product
          </label>
        </div>

        <div class="pt-4 flex items-center justify-end gap-3 border-t border-[#CFF2FF]/10">
          <button
            type="button"
            onclick={onClose}
            class="px-4 py-2 rounded-lg border border-[#CFF2FF]/30 text-sm text-[#CFF2FF] hover:bg-white/5"
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
              <span>Save Product</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
