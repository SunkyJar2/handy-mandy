<script lang="ts">
  import { Check } from 'lucide-svelte';

  interface Props {
    currentStep: 1 | 2 | 3 | 4;
  }

  let { currentStep }: Props = $props();

  const steps = [
    { num: 1, label: 'Location' },
    { num: 2, label: 'Installation & Hub' },
    { num: 3, label: 'Payment' },
    { num: 4, label: 'Confirmation' }
  ];
</script>

<!-- Stepper matching Figma frame 67:23 / 95:60 / 109:188 / 138:41 -->
<div class="w-full max-w-4xl mx-auto py-6">
  <div class="relative flex items-center justify-between">
    <!-- Background connector line -->
    <div class="absolute left-6 right-6 top-5 h-1 bg-[#B6C4D3]/30 -z-0"></div>

    {#each steps as step, index}
      {@const isCompleted = step.num < currentStep}
      {@const isCurrent = step.num === currentStep}

      <div class="relative z-10 flex flex-col items-center">
        <!-- Circle indicator 45x45 -->
        <div
          class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-['Outfit'] font-bold text-base transition-all {
            isCompleted
              ? 'bg-[#25ED82] text-[#071824] shadow-md ring-4 ring-[#25ED82]/20'
              : isCurrent
              ? 'bg-white text-[#1A3551] shadow-lg ring-4 ring-white/20 scale-105'
              : 'bg-[#151447] border-2 border-[#B6C4D3]/50 text-[#B6C4D3]'
          }"
        >
          {#if isCompleted}
            <Check class="w-5 h-5 stroke-[3]" />
          {:else}
            <span>{step.num}</span>
          {/if}
        </div>

        <!-- Label -->
        <span
          class="mt-2 text-xs sm:text-sm font-['Outfit'] font-bold tracking-tight text-center {
            isCurrent ? 'text-white' : isCompleted ? 'text-[#CFF2FF]' : 'text-[#B6C4D3]/70'
          }"
        >
          {step.label}
        </span>
      </div>
    {/each}
  </div>
</div>
