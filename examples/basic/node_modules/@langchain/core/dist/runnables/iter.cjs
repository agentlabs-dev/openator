"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeAsyncIterableInContext = exports.consumeIteratorInContext = exports.isAsyncIterable = exports.isIterator = exports.isIterableIterator = void 0;
const index_js_1 = require("../singletons/index.cjs");
const config_js_1 = require("./config.cjs");
function isIterableIterator(thing) {
    return (typeof thing === "object" &&
        thing !== null &&
        typeof thing[Symbol.iterator] === "function" &&
        // avoid detecting array/set as iterator
        typeof thing.next === "function");
}
exports.isIterableIterator = isIterableIterator;
const isIterator = (x) => x != null &&
    typeof x === "object" &&
    "next" in x &&
    typeof x.next === "function";
exports.isIterator = isIterator;
function isAsyncIterable(thing) {
    return (typeof thing === "object" &&
        thing !== null &&
        typeof thing[Symbol.asyncIterator] ===
            "function");
}
exports.isAsyncIterable = isAsyncIterable;
function* consumeIteratorInContext(context, iter) {
    while (true) {
        const { value, done } = index_js_1.AsyncLocalStorageProviderSingleton.runWithConfig((0, config_js_1.pickRunnableConfigKeys)(context), iter.next.bind(iter), true);
        if (done) {
            break;
        }
        else {
            yield value;
        }
    }
}
exports.consumeIteratorInContext = consumeIteratorInContext;
async function* consumeAsyncIterableInContext(context, iter) {
    const iterator = iter[Symbol.asyncIterator]();
    while (true) {
        const { value, done } = await index_js_1.AsyncLocalStorageProviderSingleton.runWithConfig((0, config_js_1.pickRunnableConfigKeys)(context), iterator.next.bind(iter), true);
        if (done) {
            break;
        }
        else {
            yield value;
        }
    }
}
exports.consumeAsyncIterableInContext = consumeAsyncIterableInContext;
