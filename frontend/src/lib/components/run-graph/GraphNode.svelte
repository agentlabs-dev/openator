<script lang="ts">  
  import ActionDisplay from './ActionDisplay.svelte';
	import Divider from './Divider.svelte';
	import Card from './Card.svelte';
	import TaskActionDisplay from './TaskActionDisplay.svelte';
	
  import type { Task } from '$lib/entities/task';
  
  export let task: Task
  export let noTopEdge: boolean = false;
  export let noBottomEdge: boolean = false;

  const statusClassMap: Record<Task['status'], string> = {
    'pending': 'bg-gray-200',
    'completed': 'bg-green-500',
    'failed': 'bg-red-500',
    'running': 'bg-gray-400 animate-pulse',
    'cancelled': 'bg-red-400',
  }

  $: sizeClass = 'min-w-[350px]';
  $: statusBgclass = statusClassMap[task.status];
</script>

<div class={`shrink-0 flex flex-col w-full items-center ${sizeClass}`}>
  {#if !noTopEdge}
    <Divider orientation="vertical" />
  {/if}
  <Card>
    <div class="flex overflow-hidden">
      <!-- <div class={`${statusBgclass} w-[10px] flex shrink-0 min-h-full`}></div> -->
      <div class="flex p-1">
        <div class={`p-3 grow`}>       
          <div class={`flex flex-col gap-1`}>
            <div class="flex mb-2">
              <ActionDisplay title={task.description} />
            </div>
            <div class="flex flex-col gap-1">
              {#each task.actions as action}
                <TaskActionDisplay action={action.name} status={action.status} />
              {/each}
            </div>
        </div>
      </div>
    </div>   
  </Card>
  {#if !noBottomEdge}
    <div class="flex flex-col items-center justify-center">
      <Divider orientation="vertical" />
    </div>
  {/if}
</div>
