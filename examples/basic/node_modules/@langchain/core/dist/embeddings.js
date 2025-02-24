import { AsyncCaller } from "./utils/async_caller.js";
/**
 * An abstract class that provides methods for embedding documents and
 * queries using LangChain.
 */
export class Embeddings {
    constructor(params) {
        /**
         * The async caller should be used by subclasses to make any async calls,
         * which will thus benefit from the concurrency and retry logic.
         */
        Object.defineProperty(this, "caller", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.caller = new AsyncCaller(params ?? {});
    }
}
