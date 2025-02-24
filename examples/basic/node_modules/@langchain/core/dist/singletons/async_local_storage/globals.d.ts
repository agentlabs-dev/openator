export interface AsyncLocalStorageInterface {
    getStore: () => any | undefined;
    run: <T>(store: any, callback: () => T) => T;
    enterWith: (store: any) => void;
}
export declare const TRACING_ALS_KEY: unique symbol;
export declare const _CONTEXT_VARIABLES_KEY: unique symbol;
export declare const setGlobalAsyncLocalStorageInstance: (instance: AsyncLocalStorageInterface) => void;
export declare const getGlobalAsyncLocalStorageInstance: () => AsyncLocalStorageInterface | undefined;
