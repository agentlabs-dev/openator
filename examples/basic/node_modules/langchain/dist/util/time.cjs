"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
/**
 * Sleep for a given amount of time.
 * @param ms - The number of milliseconds to sleep for. Defaults to 1000.
 * @returns A promise that resolves when the sleep is complete.
 */
async function sleep(ms = 1000) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
exports.sleep = sleep;
