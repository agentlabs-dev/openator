"use strict";
/* __LC_ALLOW_ENTRYPOINT_SIDE_EFFECTS__ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerConfigureHook = exports.setContextVariable = exports.getContextVariable = void 0;
/**
 * This file exists as a convenient public entrypoint for functionality
 * related to context variables.
 *
 * Because it automatically initializes AsyncLocalStorage, internal
 * functionality SHOULD NEVER import from this file outside of tests.
 */
const node_async_hooks_1 = require("node:async_hooks");
const index_js_1 = require("./singletons/index.cjs");
const context_js_1 = require("./singletons/async_local_storage/context.cjs");
Object.defineProperty(exports, "getContextVariable", { enumerable: true, get: function () { return context_js_1.getContextVariable; } });
Object.defineProperty(exports, "setContextVariable", { enumerable: true, get: function () { return context_js_1.setContextVariable; } });
Object.defineProperty(exports, "registerConfigureHook", { enumerable: true, get: function () { return context_js_1.registerConfigureHook; } });
index_js_1.AsyncLocalStorageProviderSingleton.initializeGlobalInstance(new node_async_hooks_1.AsyncLocalStorage());
