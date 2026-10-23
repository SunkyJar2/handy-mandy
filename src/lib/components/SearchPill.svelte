<script lang="ts">
  import { Search, X } from 'lucide-svelte';

  interface Props {
    value: string;
    placeholder?: string;
    class?: string;
    onsubmit?: (val: string) => void;
  }

  let {
    value = $bindable(''),
    placeholder = 'Search',
    class: className = '',
    onsubmit
  }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && onsubmit) {
      e.preventDefault();
      onsubmit(value);
    }
  }

  function handleClear() {
    value = '';
    if (onsubmit) onsubmit('');
  }
</script>

<!-- Search Pill matching Figma #220:288: 452x56, rounded-30px, bg-#272E5A, stroke-#4C527D -->
<div
  class="relative w-full sm:w-[380px] lg:w-[452px] h-[52px] sm:h-[56px] rounded-[30px] border border-[#4C527D] transition-all flex items-center px-5 sm:px-6 gap-3 shadow-md focus-within:border-[#CFF2FF] focus-within:ring-2 focus-within:ring-[#CFF2FF]/20 {className}"
  style="background: #272E5A;"
>
  <input
    type="text"
    bind:value
    {placeholder}
    onkeydown={handleKeydown}
    class="w-full bg-transparent text-white placeholder-[#B6C4D3] font-['Outfit'] text-base sm:text-lg focus:outline-none"
    aria-label={placeholder}
  />

  {#if value.trim().length > 0}
    <button
      type="button"
      onclick={handleClear}
      class="text-[#B6C4D3] hover:text-white p-1 rounded-full transition-colors"
      aria-label="Clear search"
    >
      <X class="w-4 h-4" />
    </button>
  {/if}

  <button
    type="button"
    onclick={() => onsubmit && onsubmit(value)}
    class="text-[#B6C4D3] hover:text-white transition-colors p-1"
    aria-label="Submit search"
  >
    <Search class="w-5 h-5 sm:w-6 sm:h-6" />
  </button>
</div>

