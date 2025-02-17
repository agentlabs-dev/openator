<script lang="ts">  
  import ActionDisplay from './ActionDisplay.svelte';
	import TaskActionDisplay from './TaskActionDisplay.svelte';
	
  import type { Task } from '$lib/entities/task';
  
  export let task: Task
  export let showActions: boolean = true;
</script>

<div class={`shrink-0 flex flex-col w-full items-center w-full`}>
  <div class="flex overflow-hidden w-full pl-4">
    <div class={`flex flex-col`}>
      <div class="flex mb-1">
        <ActionDisplay title={task.description} isRunning={task.status === 'running'} />
      </div>
      {#if showActions}
        <div class="flex flex-col">
          {#each task.actions as action}
            <TaskActionDisplay action={action.name} status={action.status} />
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
