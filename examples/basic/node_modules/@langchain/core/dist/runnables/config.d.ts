import { CallbackManager } from "../callbacks/manager.js";
import { RunnableConfig } from "./types.js";
export declare const DEFAULT_RECURSION_LIMIT = 25;
export { type RunnableConfig };
export declare function getCallbackManagerForConfig(config?: RunnableConfig): Promise<CallbackManager | undefined>;
export declare function mergeConfigs<CallOptions extends RunnableConfig>(...configs: (CallOptions | RunnableConfig | undefined | null)[]): Partial<CallOptions>;
/**
 * Ensure that a passed config is an object with all required keys present.
 */
export declare function ensureConfig<CallOptions extends RunnableConfig>(config?: CallOptions): CallOptions;
/**
 * Helper function that patches runnable configs with updated properties.
 */
export declare function patchConfig<CallOptions extends RunnableConfig>(config?: Partial<CallOptions>, { callbacks, maxConcurrency, recursionLimit, runName, configurable, runId, }?: RunnableConfig): Partial<CallOptions>;
export declare function pickRunnableConfigKeys<CallOptions extends Record<string, any>>(config?: CallOptions): Partial<RunnableConfig> | undefined;
