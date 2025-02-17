<script lang="ts">
    import TestBuilder from "$lib/components/TestBuilder.svelte";
    import { startJob } from "../services/backend-service";
    import {subscribeToRunUpdates, currentRunStore} from "$lib/stores/run";
    import RunGraph from "$lib/components/run-graph/RunGraph.svelte";
	import LiveView from "$lib/components/LiveView.svelte";
	import { goto } from "$app/navigation";
	import { ViewConversationRoute } from "$lib/routes";

    let isLoading = $state(false);
    let liveUrl = $state<string | null>(null);    
    let jobId = $state<string | null>(null);

    /**
     * This is a POC, we'll improve that later.
     */
    const generate = async ({startUrl, scenario}: {startUrl: string, scenario: string}) => {
        isLoading = true;
        const result = await startJob(startUrl, scenario);    

        liveUrl = result.liveUrl;
        jobId = result.jobId;

        subscribeToRunUpdates(jobId);
        goto(ViewConversationRoute.path(jobId));
    }

    const resetSession = () => {
        liveUrl = null;
        isLoading = false;
    }
</script>

<div class="min-h-screen flex flex-col gap-4">
    {#if liveUrl}
    <div class="flex flex-row min-h-full">
        <div class="min-w-[500px] flex flex-col justify-start items-center shrink-0 bg-white p-4 overflow-y-auto h-full border-r border-gray-200">
            <RunGraph run={$currentRunStore} />
        </div>
        <div class="flex flex-col justify-center items-center p-4 bg-gray-100 grow">
            <LiveView liveUrl={liveUrl}/>     
        </div>
    </div>            

    {:else}
        <TestBuilder onTriggerRun={generate}/>    
    {/if}
</div>