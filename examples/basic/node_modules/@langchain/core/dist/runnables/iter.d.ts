import type { RunnableConfig } from "../runnables/types.js";
export declare function isIterableIterator(thing: unknown): thing is IterableIterator<unknown>;
export declare const isIterator: (x: unknown) => x is Iterator<unknown, any, undefined>;
export declare function isAsyncIterable(thing: unknown): thing is AsyncIterable<unknown>;
export declare function consumeIteratorInContext<T>(context: Partial<RunnableConfig> | undefined, iter: IterableIterator<T>): IterableIterator<T>;
export declare function consumeAsyncIterableInContext<T>(context: Partial<RunnableConfig> | undefined, iter: AsyncIterable<T>): AsyncIterableIterator<T>;
