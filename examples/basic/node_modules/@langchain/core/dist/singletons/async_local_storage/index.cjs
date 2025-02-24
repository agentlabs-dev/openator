"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncLocalStorageProviderSingleton = exports.MockAsyncLocalStorage = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const langsmith_1 = require("langsmith");
const globals_js_1 = require("./globals.cjs");
const manager_js_1 = require("../../callbacks/manager.cjs");
class MockAsyncLocalStorage {
    getStore() {
        return undefined;
    }
    run(_store, callback) {
        return callback();
    }
    enterWith(_store) {
        return undefined;
    }
}
exports.MockAsyncLocalStorage = MockAsyncLocalStorage;
const mockAsyncLocalStorage = new MockAsyncLocalStorage();
const LC_CHILD_KEY = Symbol.for("lc:child_config");
class AsyncLocalStorageProvider {
    getInstance() {
        return (0, globals_js_1.getGlobalAsyncLocalStorageInstance)() ?? mockAsyncLocalStorage;
    }
    getRunnableConfig() {
        const storage = this.getInstance();
        // this has the runnable config
        // which means that we should also have an instance of a LangChainTracer
        // with the run map prepopulated
        return storage.getStore()?.extra?.[LC_CHILD_KEY];
    }
    runWithConfig(config, callback, avoidCreatingRootRunTree) {
        const callbackManager = manager_js_1.CallbackManager._configureSync(config?.callbacks, undefined, config?.tags, undefined, config?.metadata);
        const storage = this.getInstance();
        const previousValue = storage.getStore();
        const parentRunId = callbackManager?.getParentRunId();
        const langChainTracer = callbackManager?.handlers?.find((handler) => handler?.name === "langchain_tracer");
        let runTree;
        if (langChainTracer && parentRunId) {
            runTree = langChainTracer.convertToRunTree(parentRunId);
        }
        else if (!avoidCreatingRootRunTree) {
            runTree = new langsmith_1.RunTree({
                name: "<runnable_lambda>",
                tracingEnabled: false,
            });
        }
        if (runTree) {
            runTree.extra = { ...runTree.extra, [LC_CHILD_KEY]: config };
        }
        if (previousValue !== undefined &&
            previousValue[globals_js_1._CONTEXT_VARIABLES_KEY] !== undefined) {
            runTree[globals_js_1._CONTEXT_VARIABLES_KEY] =
                previousValue[globals_js_1._CONTEXT_VARIABLES_KEY];
        }
        return storage.run(runTree, callback);
    }
    initializeGlobalInstance(instance) {
        if ((0, globals_js_1.getGlobalAsyncLocalStorageInstance)() === undefined) {
            (0, globals_js_1.setGlobalAsyncLocalStorageInstance)(instance);
        }
    }
}
const AsyncLocalStorageProviderSingleton = new AsyncLocalStorageProvider();
exports.AsyncLocalStorageProviderSingleton = AsyncLocalStorageProviderSingleton;
