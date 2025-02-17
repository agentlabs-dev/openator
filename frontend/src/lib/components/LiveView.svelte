<script lang="ts">
  let {
    liveUrl,
  } = $props<{
    liveUrl: string;
  }>();
</script>

<style>
  .aspect-ratio-box {
    position: relative;
    width: 100%;
    padding-top: calc(900 / 1440 * 100%); /* Aspect ratio: 900/1440 */
  }
</style>

<div class="flex flex-col w-full space-y-4">
  <div class="aspect-ratio-box rounded-2xl shadow-xl relative overflow-hidden">
    <iframe title="Live View" src={liveUrl} class="left-0 top-0 absolute w-full h-full"></iframe>
  </div>
</div>