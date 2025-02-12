<script lang="ts">
    import TestBuilder from "$lib/components/TestBuilder.svelte";
	import VncPlayer from "$lib/components/vnc/VNCPlayer.svelte";
	import { triggerTestRun } from "../services/backend-service";
    import {subscribeToRunUpdates, currentRunStore} from "$lib/stores/run";
    import RunGraph from "$lib/components/run-graph/RunGraph.svelte";
	import type { Run } from "$lib/entities/run";
	import RunResultNode from "$lib/components/run-graph/RunResultNode.svelte";
    let isLoading = $state(false);
    let sessionUrl = $state<string | null>(null);
    let password = $state<string | null>(null);

    /**
     * This is a POC, we'll improve that later.
     */
    const generate = async ({startUrl, scenario}: {startUrl: string, scenario: string}) => {
        isLoading = true;
        const result = await triggerTestRun(startUrl, scenario);    

        sessionUrl = result.sessionUrl;
        password = result.password;

        subscribeToRunUpdates();
    }

    const resetSession = () => {
        sessionUrl = null;
        password = null;
        isLoading = false;
    }
</script>

<div class="min-h-screen flex flex-col gap-4">
    {#if sessionUrl && password}
    <div class="flex flex-row min-h-full">
        <div class="min-w-[500px] flex flex-col justify-start items-center shrink-0 bg-[url('/images/bg-dotted.png')] p-4 overflow-y-auto h-full border-r border-gray-200">
            <RunGraph run={$currentRunStore} />
        </div>
        <div class="flex flex-col justify-center items-center p-4 bg-white grow">
            <VncPlayer sessionUrl={sessionUrl} password={password} onDisconnect={resetSession} onConnect={() => {}}/>              
        </div>
    </div>            

    {:else}
        <TestBuilder onTriggerRun={generate}/>    
    {/if}
</div>