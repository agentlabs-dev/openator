<script lang="ts">
  export let title: string;
  export let isRunning: boolean = false;
</script>


<div class="text-md/6 text-black antialiased {isRunning ? 'animate-pulse' : ''}">
  {title}
</div>