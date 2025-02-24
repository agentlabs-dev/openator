import { Hyperbrowser } from '@hyperbrowser/sdk';
export class HyperBrowserServer {
    constructor() {
        const apiKey = process.env.HYPERBROWSER_API_KEY;
        if (!apiKey) {
            throw new Error('HYPERBROWSER_API_KEY is not set in your environment.');
        }
        this.client = new Hyperbrowser({
            apiKey: process.env.HYPERBROWSER_API_KEY,
        });
    }
    async startSession() {
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
    async stopSession(sessionId) {
        await this.client.sessions.stop(sessionId);
    }
}
//# sourceMappingURL=hyperbrowser-server.js.map