"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openator_1 = require("openator");
require("dotenv/config");
const main = async () => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
    }
    const openator = (0, openator_1.initOpenator)({
        headless: false,
        openAiApiKey: process.env.OPENAI_API_KEY,
    });
    const result = await openator.start('https://amazon.com', 'Find a black wirelesskeyboard and return the price.');
};
main();
//# sourceMappingURL=index.js.map