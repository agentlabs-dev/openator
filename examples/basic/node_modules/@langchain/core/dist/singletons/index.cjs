"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._CONTEXT_VARIABLES_KEY = exports.MockAsyncLocalStorage = exports.AsyncLocalStorageProviderSingleton = void 0;
const index_js_1 = require("./async_local_storage/index.cjs");
Object.defineProperty(exports, "AsyncLocalStorageProviderSingleton", { enumerable: true, get: function () { return index_js_1.AsyncLocalStorageProviderSingleton; } });
Object.defineProperty(exports, "MockAsyncLocalStorage", { enumerable: true, get: function () { return index_js_1.MockAsyncLocalStorage; } });
const globals_js_1 = require("./async_local_storage/globals.cjs");
Object.defineProperty(exports, "_CONTEXT_VARIABLES_KEY", { enumerable: true, get: function () { return globals_js_1._CONTEXT_VARIABLES_KEY; } });
