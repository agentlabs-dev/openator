"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTracingV2CallbackHandler = exports.getTracingCallbackHandler = void 0;
const tracer_langchain_js_1 = require("./tracer_langchain.cjs");
const tracer_langchain_v1_js_1 = require("./tracer_langchain_v1.cjs");
/**
 * @deprecated Use the V2 handler instead.
 *
 * Function that returns an instance of `LangChainTracerV1`. If a session
 * is provided, it loads that session into the tracer; otherwise, it loads
 * a default session.
 * @param session Optional session to load into the tracer.
 * @returns An instance of `LangChainTracerV1`.
 */
async function getTracingCallbackHandler(session) {
    const tracer = new tracer_langchain_v1_js_1.LangChainTracerV1();
    if (session) {
        await tracer.loadSession(session);
    }
    else {
        await tracer.loadDefaultSession();
    }
    return tracer;
}
exports.getTracingCallbackHandler = getTracingCallbackHandler;
/**
 * @deprecated Instantiate directly using the LangChainTracer constructor.
 *
 * Function that returns an instance of `LangChainTracer`. It does not
 * load any session data.
 * @returns An instance of `LangChainTracer`.
 */
async function getTracingV2CallbackHandler() {
    return new tracer_langchain_js_1.LangChainTracer();
}
exports.getTracingV2CallbackHandler = getTracingV2CallbackHandler;
