

<script lang="ts">
  import Divider from './Divider.svelte';
  import Card from './Card.svelte';
  import Icon from '@iconify/svelte';

  export let noTopEdge: boolean = false;
</script>


{#if !noTopEdge}
  <Divider orientation="horizontal" />
{/if}
<Card>
  <div class="flex flex-row items-center justify-center gap-2 p-2">
    <Icon icon="mdi:brain" class="text-pink-500 animate-pulse text-lg"/>
    <span class="text-sm">Thinking...</span>
  </div>
</Card>