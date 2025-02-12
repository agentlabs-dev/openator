<script lang="ts">
    let { 
        onSelect,
        scenario,
        startUrl
    } = $props<{
        onSelect: () => void;
        scenario: string;
        startUrl: string;
    }>();
</script>

<div class="rounded-md border border-gray-200 p-4 max-w-md bg-white cursor-pointer hover:bg-gray-50" on:click={onSelect}>
    <div class="flex flex-col space-y-2">
        <p class="text-sm text-gray-600">
            {scenario}
        </p>

        <p class="text-sm text-gray-500">
            {startUrl}
        </p>
    </div>
</div>