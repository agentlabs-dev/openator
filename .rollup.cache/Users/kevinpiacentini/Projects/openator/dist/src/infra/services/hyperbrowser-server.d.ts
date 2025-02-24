import { BrowserWebSocketServer, WSSSession } from '@/core/interfaces/browser-websocket-server.interface';
export declare class HyperBrowserServer implements BrowserWebSocketServer {
    private readonly client;
    constructor();
    startSession(): Promise<WSSSession>;
    stopSession(sessionId: string): Promise<void>;
}
