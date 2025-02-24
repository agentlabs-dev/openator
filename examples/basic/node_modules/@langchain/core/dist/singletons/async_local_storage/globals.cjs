"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalAsyncLocalStorageInstance = exports.setGlobalAsyncLocalStorageInstance = exports._CONTEXT_VARIABLES_KEY = exports.TRACING_ALS_KEY = void 0;
exports.TRACING_ALS_KEY = Symbol.for("ls:tracing_async_local_storage");
exports._CONTEXT_VARIABLES_KEY = Symbol.for("lc:context_variables");
const setGlobalAsyncLocalStorageInstance = (instance) => {
    globalThis[exports.TRACING_ALS_KEY] = instance;
};
exports.setGlobalAsyncLocalStorageInstance = setGlobalAsyncLocalStorageInstance;
const getGlobalAsyncLocalStorageInstance = () => {
    return globalThis[exports.TRACING_ALS_KEY];
};
exports.getGlobalAsyncLocalStorageInstance = getGlobalAsyncLocalStorageInstance;
