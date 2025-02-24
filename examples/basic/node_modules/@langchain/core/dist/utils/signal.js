export async function raceWithSignal(promise, signal) {
    if (signal === undefined) {
        return promise;
    }
    let listener;
    return Promise.race([
        promise.catch((err) => {
            if (!signal?.aborted) {
                throw err;
            }
            else {
                return undefined;
            }
        }),
        new Promise((_, reject) => {
            listener = () => {
                reject(new Error("Aborted"));
            };
            signal.addEventListener("abort", listener);
            // Must be here inside the promise to avoid a race condition
            if (signal.aborted) {
                reject(new Error("Aborted"));
            }
        }),
    ]).finally(() => signal.removeEventListener("abort", listener));
}
