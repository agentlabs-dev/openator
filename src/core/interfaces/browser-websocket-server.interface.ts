export interface BrowserWebSocketServer {
  startSession(): Promise<WSSSession>;
  stopSession(sessionId: string): Promise<void>;
}

export interface WSSSession {
  id: string;
  liveUrl: string;
  wsEndpoint: string;
}
