<script lang="ts">
    import BuiltinPromptCard from "$lib/components/BuiltinPromptCard.svelte";

    let { onTriggerRun } = $props();

    let formData = $state({
        scenario: '',
        startUrl: '',
    });

    const placeholder = `As a user on Amazon, when I search for "laptop", I should see a list of laptops.`;

    const isValidForm = $derived(formData.scenario.length > 0 && formData.startUrl.length > 0);

    const triggerRun = () => {
        onTriggerRun({
            startUrl: formData.startUrl,
            scenario: formData.scenario,
        });
    }    

    const selectPrompt = (scenario: string, startUrl: string) => {
        console.log('selectPrompt', scenario, startUrl);
        formData.scenario = scenario;
        formData.startUrl = startUrl;
    }

    const promptCards = [
        { startUrl: 'https://www.amazon.com', scenario: 'As a user on Amazon, when I search for "laptop", I should see a list of laptops or related products.' },
        { startUrl: 'https://www.ebay.com', scenario: 'As a user on eBay, when I search for "phone", I should see a list of phones or related products.' },
        { startUrl: 'https://www.wikipedia.com', scenario: 'As a user on Wikipedia, when I search for "Napoléon Bonaparte", I should find the biography of Napoléon Bonaparte.' },
        { startUrl: 'https://www.allrecipes.com', scenario: 'As a user I can search for recipes and open the recipe to see more details.' }
    ];
</script>

<div class="h-full w-3xl mx-auto flex flex-col justify-center">
    <div class="flex flex-col space-y-5 py-10">        
        <div class="mb-10">
            <h1 class="text-2xl font-semibold text-center">What do you want me to test?</h1>
        </div>

        <div class="grid grid-cols-2 gap-4">
            {#each promptCards as card}
                <BuiltinPromptCard scenario={card.scenario} startUrl={card.startUrl} onSelect={() => selectPrompt(card.scenario, card.startUrl)}/>
            {/each}
        </div>
        
        <div class="flex w-full cursor-text flex-col rounded-3xl border border-gray-200 shadow-sm px-4 py-2">
            <input type="text" placeholder="https://www.amazon.com" bind:value={formData.startUrl} class="block w-full resize-none bg-transparent px-0 border-none focus:outline-none">  
        </div>

        <div class="flex w-full cursor-text flex-col rounded-3xl border border-gray-200 shadow-sm px-4 py-1">
            <textarea placeholder={placeholder}
                bind:value={formData.scenario}
            class="block h-10 w-full resize-none bg-transparent px-0 py-2 border-none focus:outline-none">            
            </textarea>

            <div class="flex justify-end pb-2">
                <button disabled={!isValidForm} on:click={() => triggerRun() } aria-label="Generate" class="bg-gray-900 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 17a1 1 0 01-1-1V5.414L5.707 8.707a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L11 5.414V16a1 1 0 01-1 1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    </div>       
</div>