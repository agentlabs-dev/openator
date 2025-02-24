"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.awaitAllCallbacks = exports.consumeCallback = exports.getQueue = void 0;
const p_queue_1 = __importDefault(require("p-queue"));
const globals_js_1 = require("./async_local_storage/globals.cjs");
let queue;
/**
 * Creates a queue using the p-queue library. The queue is configured to
 * auto-start and has a concurrency of 1, meaning it will process tasks
 * one at a time.
 */
function createQueue() {
    const PQueue = "default" in p_queue_1.default ? p_queue_1.default.default : p_queue_1.default;
    return new PQueue({
        autoStart: true,
        concurrency: 1,
    });
}
function getQueue() {
    if (typeof queue === "undefined") {
        queue = createQueue();
    }
    return queue;
}
exports.getQueue = getQueue;
/**
 * Consume a promise, either adding it to the queue or waiting for it to resolve
 * @param promiseFn Promise to consume
 * @param wait Whether to wait for the promise to resolve or resolve immediately
 */
async function consumeCallback(promiseFn, wait) {
    if (wait === true) {
        // Clear config since callbacks are not part of the root run
        // Avoid using global singleton due to circuluar dependency issues
        const asyncLocalStorageInstance = (0, globals_js_1.getGlobalAsyncLocalStorageInstance)();
        if (asyncLocalStorageInstance !== undefined) {
            await asyncLocalStorageInstance.run(undefined, async () => promiseFn());
        }
        else {
            await promiseFn();
        }
    }
    else {
        queue = getQueue();
        void queue.add(async () => {
            const asyncLocalStorageInstance = (0, globals_js_1.getGlobalAsyncLocalStorageInstance)();
            if (asyncLocalStorageInstance !== undefined) {
                await asyncLocalStorageInstance.run(undefined, async () => promiseFn());
            }
            else {
                await promiseFn();
            }
        });
    }
}
exports.consumeCallback = consumeCallback;
/**
 * Waits for all promises in the queue to resolve. If the queue is
 * undefined, it immediately resolves a promise.
 */
function awaitAllCallbacks() {
    return typeof queue !== "undefined" ? queue.onIdle() : Promise.resolve();
}
exports.awaitAllCallbacks = awaitAllCallbacks;
