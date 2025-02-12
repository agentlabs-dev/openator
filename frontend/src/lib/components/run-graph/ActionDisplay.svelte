<script lang="ts">
  export let title: string;
</script>


<div class="flex items-center gap-2 justify-between w-full">
  <div class="flex items-center gap-2 text-gray-700">
    <div class={`flex flex-col text-sm`}>
      <span>{title}</span>
    </div>
  </div>
</div>