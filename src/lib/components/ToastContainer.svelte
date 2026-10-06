<script lang="ts">
  import { toast } from '$lib/stores/toast.svelte';
  import { CheckCircle2, AlertCircle, Info, X } from 'lucide-svelte';
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md pointer-events-none">
  {#each toast.toasts as item (item.id)}
    <div
      class="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 {
        item.type === 'success'
          ? 'bg-[#1A3551] border-[#25ED82]/40 text-[#CFF2FF]'
          : item.type === 'error'
          ? 'bg-[#1A3551] border-[#FF6D6F]/40 text-[#FF6D6F]'
          : 'bg-[#1A3551] border-[#4A6FA5]/50 text-[#CFF2FF]'
      }"
    >
      <div class="flex items-center gap-2.5">
        {#if item.type === 'success'}
          <CheckCircle2 class="w-5 h-5 text-[#25ED82] shrink-0" />
        {:else if item.type === 'error'}
          <AlertCircle class="w-5 h-5 text-[#FF6D6F] shrink-0" />
        {:else}
          <Info class="w-5 h-5 text-[#4A6FA5] shrink-0" />
        {/if}
        <span class="text-sm font-medium text-white">{item.message}</span>
      </div>
      <button
        onclick={() => toast.remove(item.id)}
        class="text-white/60 hover:text-white p-1 rounded transition-colors"
        aria-label="Close notification"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  {/each}
</div>
