"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTracingEnabled = void 0;
const env_js_1 = require("./env.cjs");
const isTracingEnabled = (tracingEnabled) => {
    if (tracingEnabled !== undefined) {
        return tracingEnabled;
    }
    const envVars = [
        "LANGSMITH_TRACING_V2",
        "LANGCHAIN_TRACING_V2",
        "LANGSMITH_TRACING",
        "LANGCHAIN_TRACING",
    ];
    return !!envVars.find((envVar) => (0, env_js_1.getEnvironmentVariable)(envVar) === "true");
};
exports.isTracingEnabled = isTracingEnabled;
