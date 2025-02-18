<style>
  @keyframes sizePulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.4);
    }
  }
  .animate-size {
    animation: sizePulse 2s infinite;
  }
</style>

<div class="rounded-full bg-black w-3 h-3 animate-size"></div>