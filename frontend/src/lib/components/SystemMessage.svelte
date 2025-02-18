<script lang="ts">
    let { message } = $props<{    
        message: string;
    }>();

</script>

<div class="flex justify-start w-full">
    <div class="flex flex-col gap-2 py-2 px-4 w-full">
        <div class="text-md/6 text-gray-900 antialiased">{message}</div>
    </div>    
</div>
