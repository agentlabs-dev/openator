"use strict";
/* __LC_ALLOW_ENTRYPOINT_SIDE_EFFECTS__ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchCustomEvent = void 0;
const node_async_hooks_1 = require("node:async_hooks");
const web_js_1 = require("./web.cjs");
const config_js_1 = require("../../runnables/config.cjs");
const index_js_1 = require("../../singletons/index.cjs");
index_js_1.AsyncLocalStorageProviderSingleton.initializeGlobalInstance(new node_async_hooks_1.AsyncLocalStorage());
/**
 * Dispatch a custom event.
 *
 * Note: this method is only supported in non-web environments
 * due to usage of async_hooks to infer config.
 *
 * If you are using this method in the browser, please import and use
 * from "@langchain/core/callbacks/dispatch/web".
 *
 * @param name The name of the custom event.
 * @param payload The data for the custom event.
 *   Ideally should be JSON serializable to avoid serialization issues downstream, but not enforced.
 * @param config Optional config object.
 *
 * @example
 * ```typescript
 * import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch";
 *
 * const foo = RunnableLambda.from(async (input: string) => {
 *   await dispatchCustomEvent("my_custom_event", { arbitraryField: "someval" });
 *   return input;
 * });
 *
 * const callbacks = [{
 *   handleCustomEvent: (eventName: string, payload: any) => {
 *     // Logs "my_custom_event" and { arbitraryField: "someval" }
 *     console.log(eventName, payload);
 *   }
 * }];
 *
 * await foo.invoke("hi", { callbacks })
 * ```
 */
async function dispatchCustomEvent(eventName, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
payload, config) {
    const ensuredConfig = (0, config_js_1.ensureConfig)(config);
    await (0, web_js_1.dispatchCustomEvent)(eventName, payload, ensuredConfig);
}
exports.dispatchCustomEvent = dispatchCustomEvent;
