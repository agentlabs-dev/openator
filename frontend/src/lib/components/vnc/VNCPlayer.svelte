<script lang="ts">
  import { onMount } from "svelte";
  import RunningSpinner from "../RunningSpinner.svelte";

  let {
    sessionUrl,
    password,
    onDisconnect,
    onConnect,
  } = $props<{
    sessionUrl: string;
    password: string;
    onDisconnect: () => void;
    onConnect: () => void;
  }>();

  let status = $state<'connecting' | 'connected' | 'disconnected'>('connecting');

  let vncContainer: HTMLDivElement | null = null;
  let RFB: any;
  let rfb: any; // Store the RFB connection object

  onMount(async () => {
    if (typeof window !== "undefined") {
      try {
        console.log("Loading noVNC...");
        const noVNC = await import("novnc-core");
        RFB = noVNC.default;

        const url = `ws://localhost:6080/websockify`; // WebSocket for VNC

        console.log("Connecting to VNC...");
        rfb = new RFB(vncContainer, url, {
          credentials: { password: "secret" }, // Set password if required
        });

        (rfb as any).scaleViewport = true; // Auto-scale the VNC screen
        (rfb as any).clipViewport = true;

        console.log("Setting background color to white", rfb);
        (rfb as any).background = "#fff"; // Set background color

        // Debugging: Listen for connection events
        (rfb as any).addEventListener("connect", () => {
          console.log("✅ VNC Connected!");
          status = 'connected';
          onConnect();
        });
        (rfb as any).addEventListener("disconnect", (e: any) => {
          console.log("❌ VNC Disconnected!", e);
          status = 'disconnected';
          onDisconnect();
        });

      } catch (error) {
        console.error("❌ Failed to load noVNC", error);
      }
    }
  });

  function disconnect() {
    if (rfb) {
      (rfb as any).disconnect();
      console.log("VNC Disconnected.");
    }
  }
</script>

<style>
  .aspect-ratio-box {
    position: relative;
    width: 100%;
    padding-top: calc(900 / 1440 * 100%); /* Aspect ratio: 900/1440 */
  }

  .vnc-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>

<div class="flex flex-col w-full space-y-4">
  <div class="aspect-ratio-box rounded-lg border border-gray-200 shadow-sm">
    <div bind:this={vncContainer} class="vnc-container bg-white overflow-hidden flex flex-col items-center justify-center">
    </div>
  </div>
  
  <div class="flex flex-col items-center justify-center gap-4">  
  
    {#if status === 'connecting'}
      <RunningSpinner />
    {/if}
  
    {#if status === 'connected'}
      <button class="flex justify-center items-center bg-gray-900 h-15 w-15 rounded-full cursor-pointer hover:bg-gray-800" onclick={disconnect}>
        <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" fill="currentColor" rx="5" ry="5"></rect>
        </svg>
      </button>
    {/if}
    
  </div>
</div>