<script lang="ts">
  export let liveUrl: string | null;

  let isIframeLoaded = false;
</script>

<style>
  .aspect-ratio-box {
    position: relative;
    width: 100%;
    padding-top: calc(900 / 1440 * 100%); /* Aspect ratio: 900/1440 */
  }

  .animate-scale-up {
    transform: scale(0);
    animation: scaleUp 1s forwards;
  }

  @keyframes scaleUp {
    to {
      transform: scale(1);
    }
  }
</style>

{#if !liveUrl}
<div class="flex flex-col w-full space-y-4">
  <div class="aspect-ratio-box animate-scale-up rounded-2xl shadow-xl relative overflow-hidden">
    <div class="left-0 top-0 absolute w-full h-full bg-white animate-pulse flex items-center justify-center text-gray-500 antialiased">
      Loading browser session...
    </div>
  </div>
</div>
{:else}
<div class="flex flex-col w-full space-y-4">
  <div class="aspect-ratio-box rounded-2xl shadow-xl relative overflow-hidden">
    {#if !isIframeLoaded}
      <div class="left-0 top-0 absolute w-full h-full bg-white animate-pulse flex items-center justify-center text-gray-500 antialiased">
        Loading browser session...
      </div>
    {/if}
    
    <iframe on:load={() => {isIframeLoaded = true}} title="Live View" src={liveUrl} class="left-0 top-0 absolute w-full h-full {isIframeLoaded ? '' : 'animate-pulse'}"></iframe>
  </div>
</div>
{/if}