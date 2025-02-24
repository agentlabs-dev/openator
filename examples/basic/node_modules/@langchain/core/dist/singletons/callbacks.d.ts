import PQueueMod from "p-queue";
export declare function getQueue(): PQueueMod.default<any, any>;
/**
 * Consume a promise, either adding it to the queue or waiting for it to resolve
 * @param promiseFn Promise to consume
 * @param wait Whether to wait for the promise to resolve or resolve immediately
 */
export declare function consumeCallback<T>(promiseFn: () => Promise<T> | T | void, wait: boolean): Promise<void>;
/**
 * Waits for all promises in the queue to resolve. If the queue is
 * undefined, it immediately resolves a promise.
 */
export declare function awaitAllCallbacks(): Promise<void>;
