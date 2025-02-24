import { AsyncLocalStorageProviderSingleton } from "../singletons/index.js";
import { pickRunnableConfigKeys } from "./config.js";
export function isIterableIterator(thing) {
    return (typeof thing === "object" &&
        thing !== null &&
        typeof thing[Symbol.iterator] === "function" &&
        // avoid detecting array/set as iterator
        typeof thing.next === "function");
}
export const isIterator = (x) => x != null &&
    typeof x === "object" &&
    "next" in x &&
    typeof x.next === "function";
export function isAsyncIterable(thing) {
    return (typeof thing === "object" &&
        thing !== null &&
        typeof thing[Symbol.asyncIterator] ===
            "function");
}
export function* consumeIteratorInContext(context, iter) {
    while (true) {
        const { value, done } = AsyncLocalStorageProviderSingleton.runWithConfig(pickRunnableConfigKeys(context), iter.next.bind(iter), true);
        if (done) {
            break;
        }
        else {
            yield value;
        }
    }
}
export async function* consumeAsyncIterableInContext(context, iter) {
    const iterator = iter[Symbol.asyncIterator]();
    while (true) {
        const { value, done } = await AsyncLocalStorageProviderSingleton.runWithConfig(pickRunnableConfigKeys(context), iterator.next.bind(iter), true);
        if (done) {
            break;
        }
        else {
            yield value;
        }
    }
}
