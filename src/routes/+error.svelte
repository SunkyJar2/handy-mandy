<script lang="ts">
  import { page } from '$app/state';
  import { AlertTriangle, Home, RefreshCw } from 'lucide-svelte';
</script>

<svelte:head>
  <title>{page.status} — Handy Mandy</title>
</svelte:head>

<div class="min-h-[70vh] flex items-center justify-center px-4 py-16">
  <div class="max-w-md w-full text-center space-y-6 bg-[#142A38]/60 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
    <div class="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
      <AlertTriangle class="w-8 h-8" />
    </div>

    <div class="space-y-2">
      <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/5 text-[#CFF2FF]/70 border border-white/10">
        Status {page.status}
      </span>
      <h1 class="font-['Italiana'] text-3xl sm:text-4xl text-[#F5F5F5]">
        {#if page.status === 404}
          Page Not Found
        {:else if page.status === 500}
          System Starting Up
        {:else}
          Something Went Wrong
        {/if}
      </h1>
      <p class="font-['Outfit'] text-sm text-[#CFF2FF]/80 font-light">
        {#if page.status === 404}
          The requested page could not be located.
        {:else if page.status === 500}
          The server encountered a temporary issue or the database connection is initializing.
        {:else}
          {page.error?.message || 'An unexpected error occurred.'}
        {/if}
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
      <button
        onclick={() => window.location.reload()}
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-['Outfit'] font-semibold text-sm bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
      >
        <RefreshCw class="w-4 h-4" />
        <span>Try Again</span>
      </button>

      <a
        href="/"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-['Outfit'] font-semibold text-sm bg-[#4A6FA5] hover:bg-[#5b84c0] text-white shadow-md transition-all hover:scale-[1.02]"
      >
        <Home class="w-4 h-4" />
        <span>Go to Homepage</span>
      </a>
    </div>

    <div class="pt-4 border-t border-white/10">
      <a
        href="/api/health"
        target="_blank"
        class="text-xs text-[#CFF2FF]/60 hover:text-[#CFF2FF] underline transition-colors"
      >
        View system diagnostics (/api/health)
      </a>
    </div>
  </div>
</div>
