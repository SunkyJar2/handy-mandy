<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import ProductModal from '$lib/components/ProductModal.svelte';
  import { formatIdr } from '$lib/shared/pricing';
  import { toast } from '$lib/stores/toast.svelte';
  import { Plus, Edit2, CheckCircle2, XCircle, Loader2 } from 'lucide-svelte';
  import { invalidateAll } from '$app/navigation';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let isModalOpen = $state(false);
  let editingProduct = $state<any | null>(null);
  let togglingId = $state<string | null>(null);

  function handleOpenCreate() {
    editingProduct = null;
    isModalOpen = true;
  }

  function handleOpenEdit(product: any) {
    editingProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      priceIdr: product.priceIdr,
      categoryId: product.category.id,
      imageUrl: product.imageUrl,
      isFeatured: product.isFeatured
    };
    isModalOpen = true;
  }

  function handleModalSuccess() {
    toast.show('Product saved successfully!', 'success');
    invalidateAll();
  }
</script>

<svelte:head>
  <title>Manage Product Catalog — Admin — Handy Mandy</title>
</svelte:head>

<div class="max-w-[1320px] mx-auto px-6 py-10 space-y-8">
  <!-- Header matching Figma 129:126 -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="font-['Outfit'] font-bold text-3xl sm:text-[40px] text-[#CFF2FF] leading-tight">
        Manage Product Catalog
      </h1>
      <p class="font-['Outfit'] text-base text-[#CFF2FF]/80 mt-1">
        Manage active smart home installation devices and inventory.
      </p>
    </div>

    <!-- + New Products Button (Figma 129:129 / 129:130) -->
    <button
      type="button"
      onclick={handleOpenCreate}
      class="inline-flex items-center justify-center gap-2 h-[42px] px-6 rounded-[15px] font-['Outfit'] font-medium text-base text-white hover:brightness-110 transition-all shadow-md shrink-0 active:scale-95"
      style="background: #4A6FA5;"
    >
      <Plus class="w-4 h-4" />
      <span>+ New Products</span>
    </button>
  </div>

  <!-- Products Table Panel matching Figma #129:40 / #129:65 -->
  <div
    class="w-full rounded-[30px] sm:rounded-[40px] border border-[#1A3551] overflow-hidden shadow-2xl backdrop-blur-md"
    style="background: rgba(26, 53, 81, 0.5);"
  >
    <!-- Table Column Headers (Figma 129:60, 129:61, 129:62, 129:63, 129:64) -->
    <div class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#CFF2FF]/10 text-sm sm:text-base font-['Outfit'] font-medium text-white/85">
      <div class="col-span-5 sm:col-span-4">Product</div>
      <div class="hidden sm:block sm:col-span-2">Category</div>
      <div class="col-span-3 sm:col-span-2">Price</div>
      <div class="col-span-2 sm:col-span-2">Status</div>
      <div class="col-span-2 sm:col-span-2 text-right">Action</div>
    </div>

    <!-- Rows (Figma 129:66 ... 129:119) -->
    <div class="divide-y divide-[#CFF2FF]/10">
      {#each data.products as prod (prod.id)}
        {@const isActive = prod.status === 'ACTIVE'}
        <div class="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-[#1A3551]/30 transition-colors">
          <!-- Product Name & Thumbnail -->
          <div class="col-span-5 sm:col-span-4 flex items-center gap-3.5 min-w-0">
            <img
              src={prod.imageUrl}
              alt={prod.name}
              class="w-14 h-12 sm:w-16 sm:h-14 object-cover rounded-lg border border-[#CFF2FF]/20 bg-[#071824] shrink-0"
            />
            <div class="min-w-0">
              <div class="font-['Outfit'] font-medium text-sm sm:text-base text-white truncate" title={prod.name}>
                {prod.name}
              </div>
              <div class="text-xs text-[#8CAAB5] line-clamp-1">
                {prod.description}
              </div>
            </div>
          </div>

          <!-- Category -->
          <div class="hidden sm:block sm:col-span-2">
            <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#4A6FA5]/40 text-[#CFF2FF] border border-[#CFF2FF]/20">
              {prod.category.name}
            </span>
          </div>

          <!-- Price -->
          <div class="col-span-3 sm:col-span-2 font-['Outfit'] font-bold text-sm sm:text-base text-[#25ED82]">
            {formatIdr(prod.priceIdr)}
          </div>

          <!-- Status Pill -->
          <div class="col-span-2 sm:col-span-2">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold {
                isActive
                  ? 'bg-[#25ED82]/20 border border-[#25ED82]/50 text-[#25ED82]'
                  : 'bg-[#FF6D6F]/20 border border-[#FF6D6F]/50 text-[#FF6D6F]'
              }"
            >
              {#if isActive}
                <CheckCircle2 class="w-3.5 h-3.5" />
                <span>Active</span>
              {:else}
                <XCircle class="w-3.5 h-3.5" />
                <span>Inactive</span>
              {/if}
            </span>
          </div>

          <!-- Actions -->
          <div class="col-span-2 sm:col-span-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onclick={() => handleOpenEdit(prod)}
              class="p-1.5 rounded-lg text-[#CFF2FF]/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Edit product"
            >
              <Edit2 class="w-4 h-4" />
            </button>

            <!-- Toggle Status Form Action -->
            <form
              method="POST"
              action="?/toggleStatus"
              use:enhance={() => {
                togglingId = prod.id;
                return async ({ result, update }) => {
                  togglingId = null;
                  if (result.type === 'success') {
                    toast.show(
                      `Product ${isActive ? 'deactivated' : 'activated'}!`,
                      isActive ? 'info' : 'success'
                    );
                  }
                  await update();
                };
              }}
            >
              <input type="hidden" name="productId" value={prod.id} />
              <input type="hidden" name="status" value={prod.status} />
              <button
                type="submit"
                disabled={togglingId === prod.id}
                class="font-['Outfit'] text-xs sm:text-sm font-semibold transition-colors px-2 py-1 rounded hover:underline {
                  isActive ? 'text-[#FF6D6F] hover:text-[#ff8f91]' : 'text-[#25ED82] hover:text-[#52ff9e]'
                }"
              >
                {#if togglingId === prod.id}
                  <Loader2 class="w-3.5 h-3.5 animate-spin inline" />
                {:else}
                  <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                {/if}
              </button>
            </form>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<ProductModal
  isOpen={isModalOpen}
  categories={data.categories}
  initialProduct={editingProduct}
  onClose={() => (isModalOpen = false)}
  onSuccess={handleModalSuccess}
/>
