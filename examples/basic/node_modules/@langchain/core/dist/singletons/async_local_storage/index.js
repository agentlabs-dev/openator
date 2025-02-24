/* eslint-disable @typescript-eslint/no-explicit-any */
import { RunTree } from "langsmith";
import { getGlobalAsyncLocalStorageInstance, setGlobalAsyncLocalStorageInstance, _CONTEXT_VARIABLES_KEY, } from "./globals.js";
import { CallbackManager } from "../../callbacks/manager.js";
export class MockAsyncLocalStorage {
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
const mockAsyncLocalStorage = new MockAsyncLocalStorage();
const LC_CHILD_KEY = Symbol.for("lc:child_config");
class AsyncLocalStorageProvider {
    getInstance() {
        return getGlobalAsyncLocalStorageInstance() ?? mockAsyncLocalStorage;
    }
    getRunnableConfig() {
        const storage = this.getInstance();
        // this has the runnable config
        // which means that we should also have an instance of a LangChainTracer
        // with the run map prepopulated
        return storage.getStore()?.extra?.[LC_CHILD_KEY];
    }
    runWithConfig(config, callback, avoidCreatingRootRunTree) {
        const callbackManager = CallbackManager._configureSync(config?.callbacks, undefined, config?.tags, undefined, config?.metadata);
        const storage = this.getInstance();
        const previousValue = storage.getStore();
        const parentRunId = callbackManager?.getParentRunId();
        const langChainTracer = callbackManager?.handlers?.find((handler) => handler?.name === "langchain_tracer");
        let runTree;
        if (langChainTracer && parentRunId) {
            runTree = langChainTracer.convertToRunTree(parentRunId);
        }
        else if (!avoidCreatingRootRunTree) {
            runTree = new RunTree({
                name: "<runnable_lambda>",
                tracingEnabled: false,
            });
        }
        if (runTree) {
            runTree.extra = { ...runTree.extra, [LC_CHILD_KEY]: config };
        }
        if (previousValue !== undefined &&
            previousValue[_CONTEXT_VARIABLES_KEY] !== undefined) {
            runTree[_CONTEXT_VARIABLES_KEY] =
                previousValue[_CONTEXT_VARIABLES_KEY];
        }
        return storage.run(runTree, callback);
    }
    initializeGlobalInstance(instance) {
        if (getGlobalAsyncLocalStorageInstance() === undefined) {
            setGlobalAsyncLocalStorageInstance(instance);
        }
    }
}
const AsyncLocalStorageProviderSingleton = new AsyncLocalStorageProvider();
export { AsyncLocalStorageProviderSingleton };
