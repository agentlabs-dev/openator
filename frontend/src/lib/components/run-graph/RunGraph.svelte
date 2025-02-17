<script lang="ts">
	import type { Run } from '$lib/entities/run';
  
	import GraphNode from './GraphNode.svelte';
	import BrainNode from './BrainNode.svelte';
	import RunResultNode from './RunResultNode.svelte';

  export let run: Run | null;
</script>

<div class="px-4 w-full">
  <div class="flex flex-col gap-2 w-full border-l-4 gap-4 border-gray-100">
    {#if !!run}
      {#each run.tasks as task, index}
        <GraphNode task={task} />
      {/each}
    {/if}
  
    {#if !run || run.brainState === 'thinking'}  
      <div class="pl-4"><BrainNode></BrainNode></div>
    {/if}
  
    {#if run && run.status === 'completed'}
      <RunResultNode status="success" reason={run.resultReason}></RunResultNode>
    {:else if run && run.status === 'failed'}
      <RunResultNode status="failure" reason={run.resultReason}></RunResultNode>
    {/if}
  </div>
</div>