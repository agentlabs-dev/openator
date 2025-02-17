<script lang="ts">
	import type { Job } from '$lib/entities/job';
  
	import GraphNode from './GraphNode.svelte';
	import BrainNode from './BrainNode.svelte';

  export let job: Job | null;
</script>

<div class="px-4 w-full">
  <div class="flex flex-col gap-2 w-full border-l-4 border-gray-100">
    {#if !!job}
      {#each job.tasks as task, index}
        <GraphNode task={task} showActions={task.status === 'running'} />
      {/each}
    {/if}
  
    {#if !job || job.brainState === 'thinking'}  
      <div class="pl-4"><BrainNode></BrainNode></div>
    {/if}
  </div>
</div>