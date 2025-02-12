<script lang="ts">
  export let orientation: 'vertical' | 'horizontal' = 'vertical';

  $: orientationClass = orientation === 'vertical' ? 'h-2 w-[1px]' : 'h-1 w-1';
</script>
<div class={`${orientationClass} bg-gray-200`}></div>