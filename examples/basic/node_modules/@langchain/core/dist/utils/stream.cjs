"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipeGeneratorWithSetup = exports.AsyncGeneratorWithSetup = exports.concat = exports.atee = exports.IterableReadableStream = void 0;
const config_js_1 = require("../runnables/config.cjs");
const index_js_1 = require("../singletons/index.cjs");
const signal_js_1 = require("./signal.cjs");
/*
 * Support async iterator syntax for ReadableStreams in all environments.
 * Source: https://github.com/MattiasBuelens/web-streams-polyfill/pull/122#issuecomment-1627354490
 */
class IterableReadableStream extends ReadableStream {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "reader", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    ensureReader() {
        if (!this.reader) {
            this.reader = this.getReader();
        }
    }
    async next() {
        this.ensureReader();
        try {
            const result = await this.reader.read();
            if (result.done) {
                this.reader.releaseLock(); // release lock when stream becomes closed
                return {
                    done: true,
                    value: undefined,
                };
            }
            else {
                return {
                    done: false,
                    value: result.value,
                };
            }
        }
        catch (e) {
            this.reader.releaseLock(); // release lock when stream becomes errored
            throw e;
        }
    }
    async return() {
        this.ensureReader();
        // If wrapped in a Node stream, cancel is already called.
        if (this.locked) {
            const cancelPromise = this.reader.cancel(); // cancel first, but don't await yet
            this.reader.releaseLock(); // release lock first
            await cancelPromise; // now await it
        }
        return { done: true, value: undefined };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async throw(e) {
        this.ensureReader();
        if (this.locked) {
            const cancelPromise = this.reader.cancel(); // cancel first, but don't await yet
            this.reader.releaseLock(); // release lock first
            await cancelPromise; // now await it
        }
        throw e;
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Not present in Node 18 types, required in latest Node 22
    async [Symbol.asyncDispose]() {
        await this.return();
    }
    static fromReadableStream(stream) {
        // From https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#reading_the_stream
        const reader = stream.getReader();
        return new IterableReadableStream({
            start(controller) {
                return pump();
                function pump() {
                    return reader.read().then(({ done, value }) => {
                        // When no more data needs to be consumed, close the stream
                        if (done) {
                            controller.close();
                            return;
                        }
                        // Enqueue the next data chunk into our target stream
                        controller.enqueue(value);
                        return pump();
                    });
                }
            },
            cancel() {
                reader.releaseLock();
            },
        });
    }
    static fromAsyncGenerator(generator) {
        return new IterableReadableStream({
            async pull(controller) {
                const { value, done } = await generator.next();
                // When no more data needs to be consumed, close the stream
                if (done) {
                    controller.close();
                }
                // Fix: `else if (value)` will hang the streaming when nullish value (e.g. empty string) is pulled
                controller.enqueue(value);
            },
            async cancel(reason) {
                await generator.return(reason);
            },
        });
    }
}
exports.IterableReadableStream = IterableReadableStream;
function atee(iter, length = 2) {
    const buffers = Array.from({ length }, () => []);
    return buffers.map(async function* makeIter(buffer) {
        while (true) {
            if (buffer.length === 0) {
                const result = await iter.next();
                for (const buffer of buffers) {
                    buffer.push(result);
                }
            }
            else if (buffer[0].done) {
                return;
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                yield buffer.shift().value;
            }
        }
    });
}
exports.atee = atee;
function concat(first, second) {
    if (Array.isArray(first) && Array.isArray(second)) {
        return first.concat(second);
    }
    else if (typeof first === "string" && typeof second === "string") {
        return (first + second);
    }
    else if (typeof first === "number" && typeof second === "number") {
        return (first + second);
    }
    else if (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "concat" in first &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof first.concat === "function") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return first.concat(second);
    }
    else if (typeof first === "object" && typeof second === "object") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chunk = { ...first };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const [key, value] of Object.entries(second)) {
            if (key in chunk && !Array.isArray(chunk[key])) {
                chunk[key] = concat(chunk[key], value);
            }
            else {
                chunk[key] = value;
            }
        }
        return chunk;
    }
    else {
        throw new Error(`Cannot concat ${typeof first} and ${typeof second}`);
    }
}
exports.concat = concat;
class AsyncGeneratorWithSetup {
    constructor(params) {
        Object.defineProperty(this, "generator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "setup", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "signal", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "firstResult", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "firstResultUsed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.generator = params.generator;
        this.config = params.config;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.signal = params.signal ?? this.config?.signal;
        // setup is a promise that resolves only after the first iterator value
        // is available. this is useful when setup of several piped generators
        // needs to happen in logical order, ie. in the order in which input to
        // to each generator is available.
        this.setup = new Promise((resolve, reject) => {
            void index_js_1.AsyncLocalStorageProviderSingleton.runWithConfig((0, config_js_1.pickRunnableConfigKeys)(params.config), async () => {
                this.firstResult = params.generator.next();
                if (params.startSetup) {
                    this.firstResult.then(params.startSetup).then(resolve, reject);
                }
                else {
                    this.firstResult.then((_result) => resolve(undefined), reject);
                }
            }, true);
        });
    }
    async next(...args) {
        this.signal?.throwIfAborted();
        if (!this.firstResultUsed) {
            this.firstResultUsed = true;
            return this.firstResult;
        }
        return index_js_1.AsyncLocalStorageProviderSingleton.runWithConfig((0, config_js_1.pickRunnableConfigKeys)(this.config), this.signal
            ? async () => {
                return (0, signal_js_1.raceWithSignal)(this.generator.next(...args), this.signal);
            }
            : async () => {
                return this.generator.next(...args);
            }, true);
    }
    async return(value) {
        return this.generator.return(value);
    }
    async throw(e) {
        return this.generator.throw(e);
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Not present in Node 18 types, required in latest Node 22
    async [Symbol.asyncDispose]() {
        await this.return();
    }
}
exports.AsyncGeneratorWithSetup = AsyncGeneratorWithSetup;
async function pipeGeneratorWithSetup(to, generator, startSetup, signal, ...args) {
    const gen = new AsyncGeneratorWithSetup({
        generator,
        startSetup,
        signal,
    });
    const setup = await gen.setup;
    return { output: to(gen, setup, ...args), setup };
}
exports.pipeGeneratorWithSetup = pipeGeneratorWithSetup;
