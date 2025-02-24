"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultLangChainClientSingleton = exports.getDefaultLangChainClientSingleton = void 0;
const langsmith_1 = require("langsmith");
const env_js_1 = require("../utils/env.cjs");
let client;
const getDefaultLangChainClientSingleton = () => {
    if (client === undefined) {
        const clientParams = (0, env_js_1.getEnvironmentVariable)("LANGCHAIN_CALLBACKS_BACKGROUND") === "false"
            ? {
                // LangSmith has its own backgrounding system
                blockOnRootRunFinalization: true,
            }
            : {};
        client = new langsmith_1.Client(clientParams);
    }
    return client;
};
exports.getDefaultLangChainClientSingleton = getDefaultLangChainClientSingleton;
const setDefaultLangChainClientSingleton = (newClient) => {
    client = newClient;
};
exports.setDefaultLangChainClientSingleton = setDefaultLangChainClientSingleton;
