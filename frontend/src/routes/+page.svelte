<script lang="ts">
    import TestBuilder from "$lib/components/TestBuilder.svelte";
    import { startJob } from "../services/backend-service";
	import { goto } from "$app/navigation";
	import { ViewJobRoute } from "$lib/routes";


    let isLoading = $state(false);
    let liveUrl = $state<string | null>(null);    
    let jobId = $state<string | null>(null);

    /**
     * This is a POC, we'll improve that later.
     */
    const generate = async ({startUrl, scenario}: {startUrl: string, scenario: string}) => {
        isLoading = true;
        const result = await startJob(startUrl, scenario);    

        jobId = result.jobId;
        goto(ViewJobRoute.path(jobId));
    }
</script>

<div class="min-h-screen flex flex-col gap-4">
    <TestBuilder onTriggerRun={generate} isGenerating={isLoading}/>
</div>