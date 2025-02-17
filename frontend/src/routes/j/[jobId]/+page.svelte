<script lang="ts">
    import RunGraph from "$lib/components/run-graph/RunGraph.svelte";
	import LiveView from "$lib/components/LiveView.svelte";

    import { page } from "$app/state";
	import { onMount } from "svelte";
	import UserMessage from "$lib/components/UserMessage.svelte";
	import SystemMessage from "$lib/components/SystemMessage.svelte";	
	import { readAndListenJob } from "$lib/usecases/listen-job";
	import { chatStore } from "$lib/stores/chat";

    const jobId = $derived(page.params.jobId)

    onMount(async () => {
        await readAndListenJob(jobId);
    })
</script>

<div class="min-h-screen flex flex-col gap-4">
    <div class="flex flex-row min-h-full">
        <div class="min-w-[500px] max-w-[500px] flex flex-col gap-4 justify-start items-center shrink-0 bg-white p-4 overflow-y-auto h-full border-r border-gray-200">
            <UserMessage message="You want to do this and that and this and that and this is bad really" />
            <SystemMessage message="Let's accomplish this task, you can consider it done. 🎉" />
            <RunGraph job={$chatStore.job ?? null} />
            {#if $chatStore.job?.result}
                <SystemMessage message={$chatStore.job?.result} />
            {/if}
        </div>
        <div class="flex flex-col justify-center items-center p-4 bg-gray-100 grow">
            <LiveView liveUrl={$chatStore.job?.liveUrl ?? null}/> 
        </div>
    </div>
</div>