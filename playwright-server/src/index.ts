import { chromium } from 'playwright-core';

(async () => {
  // Launch the Playwright browser server on port 9222 with a visible display
  const browserServer = await chromium.launchServer({
    headless: false,
    port: 9222,
    wsPath: '/ws-endpoint',
  });
  console.log(`Playwright server started. WS endpoint: ${browserServer.wsEndpoint()}`);
  // Keep the process running
  await new Promise(() => {});
})();
