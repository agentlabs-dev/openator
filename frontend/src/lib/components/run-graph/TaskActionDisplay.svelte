<script lang="ts">
  import Icon from '@iconify/svelte';

  type Action = 'fillInput' | 'clickElement' | 'goToUrl' | 'triggerResult' | 'scrollDown' | 'scrollUp' | 'extractContent';
  type Status = 'pending' | 'completed' | 'cancelled' | 'failed' | 'running';

  export let action: Action;
  export let status: Status;

  const actionItems: Record<Action, {
    label: string,
    icon: string
  }> = {
    fillInput: {
      label: 'Type',
      icon: 'mdi:keyboard'
    },
    clickElement: {
      label: 'Click',
      icon: 'mdi:cursor-default-click'
    },
    goToUrl: {
      label: 'Navigate to URL',
      icon: 'mdi:link'
    },
    triggerResult: {
      label: 'Completed',
      icon: 'mdi:check'
    },
    scrollDown: {
      label: 'Scroll down',
      icon: 'mdi:mouse-move-down'
    },
    scrollUp: {
      label: 'Scroll up',
      icon: 'mdi:mouse-move-up'
    },
    extractContent: {
      label: 'Extract content',
      icon: 'mdi:text-box-multiple-outline'
    }
  }

  const statusColor: Record<Status, string> = {
    pending: 'text-gray-200',
    completed: 'text-gray-500',
    cancelled: 'text-gray-200',
    failed: 'text-orange-500',
    running: 'text-gray-500 animate-pulse'
  }

  const actionItem = actionItems[action];
  $: color = statusColor[status] || 'text-gray-400';
</script>

<div class="flex items-center gap-2 justify-between w-full">
  <div class="flex items-center gap-2 text-gray-700">
    <div class={`flex flex-col text-sm`}>
      <span class="flex items-center gap-2">
        <Icon icon={actionItem.icon} class={color} />
        {actionItem.label}</span>
    </div>
  </div>
</div>