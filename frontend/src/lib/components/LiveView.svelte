<script lang="ts">
  let {
    liveUrl,
    isLoading,
  } = $props<{
    liveUrl: string | null,
    isLoading: boolean,
  }>();
</script>

<style>
  .aspect-ratio-box {
    position: relative;
    width: 100%;
    padding-top: calc(900 / 1440 * 100%); /* Aspect ratio: 900/1440 */
  }
</style>

{#if isLoading || !liveUrl}
<div class="flex flex-col w-full space-y-4">
  <div class="aspect-ratio-box rounded-2xl shadow-xl relative overflow-hidden">
    <div class="left-0 top-0 absolute w-full h-full bg-white animate-pulse flex items-center justify-center text-gray-500 antialiased">
      Loading browser session...
    </div>
  </div>
</div>
{:else if !!liveUrl}
<div class="flex flex-col w-full space-y-4">
  <div class="aspect-ratio-box rounded-2xl shadow-xl relative overflow-hidden">
    <iframe title="Live View" src={liveUrl} class="left-0 top-0 absolute w-full h-full"></iframe>
  </div>
</div>
{/if}