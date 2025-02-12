<script lang="ts">
	import type { Run } from '$lib/entities/run';
  
	import GraphNode from './GraphNode.svelte';
	import BrainNode from './BrainNode.svelte';
	import RunResultNode from './RunResultNode.svelte';

  export let run: Run | null;
</script>

<div class="flex flex-col gap w-full">
  {#if !!run}
    {#each run.tasks as task, index}
      <GraphNode task={task} noTopEdge={index === 0} noBottomEdge={index === run.tasks.length - 1 && run.brainState !== 'thinking' && run.status !== 'completed' && run.status !== 'failed'} />
    {/each}
  {/if}

  {#if !run || run.brainState === 'thinking'}  
    <BrainNode noTopEdge={!run || run.tasks.length === 0}></BrainNode>
  {/if}

  {#if run && run.status === 'completed'}
    <RunResultNode status="success" reason={run.resultReason}></RunResultNode>
  {:else if run && run.status === 'failed'}
    <RunResultNode status="failure" reason={run.resultReason}></RunResultNode>
  {/if}
</div>