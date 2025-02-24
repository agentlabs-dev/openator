"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickRunnableConfigKeys = exports.patchConfig = exports.ensureConfig = exports.mergeConfigs = exports.getCallbackManagerForConfig = exports.DEFAULT_RECURSION_LIMIT = void 0;
const manager_js_1 = require("../callbacks/manager.cjs");
const index_js_1 = require("../singletons/index.cjs");
exports.DEFAULT_RECURSION_LIMIT = 25;
async function getCallbackManagerForConfig(config) {
    return manager_js_1.CallbackManager._configureSync(config?.callbacks, undefined, config?.tags, undefined, config?.metadata);
}
exports.getCallbackManagerForConfig = getCallbackManagerForConfig;
function mergeConfigs(...configs) {
    // We do not want to call ensureConfig on the empty state here as this may cause
    // double loading of callbacks if async local storage is being used.
    const copy = {};
    for (const options of configs.filter((c) => !!c)) {
        for (const key of Object.keys(options)) {
            if (key === "metadata") {
                copy[key] = { ...copy[key], ...options[key] };
            }
            else if (key === "tags") {
                const baseKeys = copy[key] ?? [];
                copy[key] = [...new Set(baseKeys.concat(options[key] ?? []))];
            }
            else if (key === "configurable") {
                copy[key] = { ...copy[key], ...options[key] };
            }
            else if (key === "timeout") {
                if (copy.timeout === undefined) {
                    copy.timeout = options.timeout;
                }
                else if (options.timeout !== undefined) {
                    copy.timeout = Math.min(copy.timeout, options.timeout);
                }
            }
            else if (key === "signal") {
                if (copy.signal === undefined) {
                    copy.signal = options.signal;
                }
                else if (options.signal !== undefined) {
                    if ("any" in AbortSignal) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        copy.signal = AbortSignal.any([
                            copy.signal,
                            options.signal,
                        ]);
                    }
                    else {
                        copy.signal = options.signal;
                    }
                }
            }
            else if (key === "callbacks") {
                const baseCallbacks = copy.callbacks;
                const providedCallbacks = options.callbacks;
                // callbacks can be either undefined, Array<handler> or manager
                // so merging two callbacks values has 6 cases
                if (Array.isArray(providedCallbacks)) {
                    if (!baseCallbacks) {
                        copy.callbacks = providedCallbacks;
                    }
                    else if (Array.isArray(baseCallbacks)) {
                        copy.callbacks = baseCallbacks.concat(providedCallbacks);
                    }
                    else {
                        // baseCallbacks is a manager
                        const manager = baseCallbacks.copy();
                        for (const callback of providedCallbacks) {
                            manager.addHandler((0, manager_js_1.ensureHandler)(callback), true);
                        }
                        copy.callbacks = manager;
                    }
                }
                else if (providedCallbacks) {
                    // providedCallbacks is a manager
                    if (!baseCallbacks) {
                        copy.callbacks = providedCallbacks;
                    }
                    else if (Array.isArray(baseCallbacks)) {
                        const manager = providedCallbacks.copy();
                        for (const callback of baseCallbacks) {
                            manager.addHandler((0, manager_js_1.ensureHandler)(callback), true);
                        }
                        copy.callbacks = manager;
                    }
                    else {
                        // baseCallbacks is also a manager
                        copy.callbacks = new manager_js_1.CallbackManager(providedCallbacks._parentRunId, {
                            handlers: baseCallbacks.handlers.concat(providedCallbacks.handlers),
                            inheritableHandlers: baseCallbacks.inheritableHandlers.concat(providedCallbacks.inheritableHandlers),
                            tags: Array.from(new Set(baseCallbacks.tags.concat(providedCallbacks.tags))),
                            inheritableTags: Array.from(new Set(baseCallbacks.inheritableTags.concat(providedCallbacks.inheritableTags))),
                            metadata: {
                                ...baseCallbacks.metadata,
                                ...providedCallbacks.metadata,
                            },
                        });
                    }
                }
            }
            else {
                const typedKey = key;
                copy[typedKey] = options[typedKey] ?? copy[typedKey];
            }
        }
    }
    return copy;
}
exports.mergeConfigs = mergeConfigs;
const PRIMITIVES = new Set(["string", "number", "boolean"]);
/**
 * Ensure that a passed config is an object with all required keys present.
 */
function ensureConfig(config) {
    const implicitConfig = index_js_1.AsyncLocalStorageProviderSingleton.getRunnableConfig();
    let empty = {
        tags: [],
        metadata: {},
        recursionLimit: 25,
        runId: undefined,
    };
    if (implicitConfig) {
        // Don't allow runId and runName to be loaded implicitly, as this can cause
        // child runs to improperly inherit their parents' run ids.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { runId, runName, ...rest } = implicitConfig;
        empty = Object.entries(rest).reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (currentConfig, [key, value]) => {
            if (value !== undefined) {
                // eslint-disable-next-line no-param-reassign
                currentConfig[key] = value;
            }
            return currentConfig;
        }, empty);
    }
    if (config) {
        empty = Object.entries(config).reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (currentConfig, [key, value]) => {
            if (value !== undefined) {
                // eslint-disable-next-line no-param-reassign
                currentConfig[key] = value;
            }
            return currentConfig;
        }, empty);
    }
    if (empty?.configurable) {
        for (const key of Object.keys(empty.configurable)) {
            if (PRIMITIVES.has(typeof empty.configurable[key]) &&
                !empty.metadata?.[key]) {
                if (!empty.metadata) {
                    empty.metadata = {};
                }
                empty.metadata[key] = empty.configurable[key];
            }
        }
    }
    if (empty.timeout !== undefined) {
        if (empty.timeout <= 0) {
            throw new Error("Timeout must be a positive number");
        }
        const timeoutSignal = AbortSignal.timeout(empty.timeout);
        if (empty.signal !== undefined) {
            if ("any" in AbortSignal) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                empty.signal = AbortSignal.any([empty.signal, timeoutSignal]);
            }
        }
        else {
            empty.signal = timeoutSignal;
        }
        delete empty.timeout;
    }
    return empty;
}
exports.ensureConfig = ensureConfig;
/**
 * Helper function that patches runnable configs with updated properties.
 */
function patchConfig(config = {}, { callbacks, maxConcurrency, recursionLimit, runName, configurable, runId, } = {}) {
    const newConfig = ensureConfig(config);
    if (callbacks !== undefined) {
        /**
         * If we're replacing callbacks we need to unset runName
         * since that should apply only to the same run as the original callbacks
         */
        delete newConfig.runName;
        newConfig.callbacks = callbacks;
    }
    if (recursionLimit !== undefined) {
        newConfig.recursionLimit = recursionLimit;
    }
    if (maxConcurrency !== undefined) {
        newConfig.maxConcurrency = maxConcurrency;
    }
    if (runName !== undefined) {
        newConfig.runName = runName;
    }
    if (configurable !== undefined) {
        newConfig.configurable = { ...newConfig.configurable, ...configurable };
    }
    if (runId !== undefined) {
        delete newConfig.runId;
    }
    return newConfig;
}
exports.patchConfig = patchConfig;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickRunnableConfigKeys(config) {
    return config
        ? {
            configurable: config.configurable,
            recursionLimit: config.recursionLimit,
            callbacks: config.callbacks,
            tags: config.tags,
            metadata: config.metadata,
            maxConcurrency: config.maxConcurrency,
            timeout: config.timeout,
            signal: config.signal,
        }
        : undefined;
}
exports.pickRunnableConfigKeys = pickRunnableConfigKeys;
