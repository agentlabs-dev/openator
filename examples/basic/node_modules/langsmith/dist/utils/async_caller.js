import pRetry from "p-retry";
import PQueueMod from "p-queue";
import { _getFetchImplementation } from "../singletons/fetch.js";
const STATUS_NO_RETRY = [
    400, // Bad Request
    401, // Unauthorized
    403, // Forbidden
    404, // Not Found
    405, // Method Not Allowed
    406, // Not Acceptable
    407, // Proxy Authentication Required
    408, // Request Timeout
];
const STATUS_IGNORE = [
    409, // Conflict
];
/**
 * A class that can be used to make async calls with concurrency and retry logic.
 *
 * This is useful for making calls to any kind of "expensive" external resource,
 * be it because it's rate-limited, subject to network issues, etc.
 *
 * Concurrent calls are limited by the `maxConcurrency` parameter, which defaults
 * to `Infinity`. This means that by default, all calls will be made in parallel.
 *
 * Retries are limited by the `maxRetries` parameter, which defaults to 6. This
 * means that by default, each call will be retried up to 6 times, with an
 * exponential backoff between each attempt.
 */
export class AsyncCaller {
    constructor(params) {
        Object.defineProperty(this, "maxConcurrency", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxRetries", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onFailedResponseHook", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.maxConcurrency = params.maxConcurrency ?? Infinity;
        this.maxRetries = params.maxRetries ?? 6;
        if ("default" in PQueueMod) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.queue = new PQueueMod.default({
                concurrency: this.maxConcurrency,
            });
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.queue = new PQueueMod({ concurrency: this.maxConcurrency });
        }
        this.onFailedResponseHook = params?.onFailedResponseHook;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    call(callable, ...args) {
        const onFailedResponseHook = this.onFailedResponseHook;
        return this.queue.add(() => pRetry(() => callable(...args).catch((error) => {
            // eslint-disable-next-line no-instanceof/no-instanceof
            if (error instanceof Error) {
                throw error;
            }
            else {
                throw new Error(error);
            }
        }), {
            async onFailedAttempt(error) {
                if (error.message.startsWith("Cancel") ||
                    error.message.startsWith("TimeoutError") ||
                    error.message.startsWith("AbortError")) {
                    throw error;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (error?.code === "ECONNABORTED") {
                    throw error;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response = error?.response;
                const status = response?.status;
                if (status) {
                    if (STATUS_NO_RETRY.includes(+status)) {
                        throw error;
                    }
                    else if (STATUS_IGNORE.includes(+status)) {
                        return;
                    }
                    if (onFailedResponseHook) {
                        await onFailedResponseHook(response);
                    }
                }
            },
            // If needed we can change some of the defaults here,
            // but they're quite sensible.
            retries: this.maxRetries,
            randomize: true,
        }), { throwOnTimeout: true });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callWithOptions(options, callable, ...args) {
        // Note this doesn't cancel the underlying request,
        // when available prefer to use the signal option of the underlying call
        if (options.signal) {
            return Promise.race([
                this.call(callable, ...args),
                new Promise((_, reject) => {
                    options.signal?.addEventListener("abort", () => {
                        reject(new Error("AbortError"));
                    });
                }),
            ]);
        }
        return this.call(callable, ...args);
    }
    fetch(...args) {
        return this.call(() => _getFetchImplementation()(...args).then((res) => res.ok ? res : Promise.reject(res)));
    }
}
