<script lang="ts">
    let { message } = $props<{    
        message: string;
    }>();

</script>

<div class="flex justify-end w-full">
    <div class="flex flex-col gap-2 bg-gray-100 py-2 px-4 rounded-2xl max-w-[80%]">
        <div class="text-md/7 text-gray-800 antialiased">{message}</div>
    </div>    
</div>
