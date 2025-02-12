<script lang="ts">
  import Divider from './Divider.svelte';
  import Card from './Card.svelte';
  import Icon from '@iconify/svelte';

  export let status: 'success' | 'failure' = 'success';
  export let reason: string = '';
</script>

<Divider orientation="horizontal" />
<Card>
  <div class="flex flex-row items-center justify-center gap-2 p-2">
    {#if status === 'success'}
      <Icon icon="mdi:check-circle" class="text-green-500 text-lg"/>
      <span class="text-sm">{reason}</span>
    {:else}
      <Icon icon="mdi:close-circle" class="text-orange-500 text-lg"/>
      <span class="text-sm">{reason}</span>
    {/if}
  </div>
</Card>