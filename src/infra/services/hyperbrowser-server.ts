import HyperbrowserClient, { Hyperbrowser } from '@hyperbrowser/sdk';
import {
  BrowserWebSocketServer,
  WSSSession,
} from '@/core/interfaces/browser-websocket-server.interface';

export class HyperBrowserServer implements BrowserWebSocketServer {
  private readonly client: HyperbrowserClient;

  constructor() {
    const apiKey = process.env.HYPERBROWSER_API_KEY;

    if (!apiKey) {
      throw new Error('HYPERBROWSER_API_KEY is not set in your environment.');
    }

    this.client = new Hyperbrowser({
      apiKey: process.env.HYPERBROWSER_API_KEY,
    });
  }

  async startSession(): Promise<WSSSession> {
    const session = await this.client.sessions.create({
      screen: {
        width: 1440,
        height: 900,
      },
    });
    return {
      wsEndpoint: session.wsEndpoint,
      id: session.id,
      liveUrl: session.liveUrl,
    };
  }

  async stopSession(sessionId: string): Promise<void> {
    await this.client.sessions.stop(sessionId);
  }
}
