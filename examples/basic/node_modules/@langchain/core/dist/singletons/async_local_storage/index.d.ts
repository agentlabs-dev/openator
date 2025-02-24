import { AsyncLocalStorageInterface } from "./globals.js";
export declare class MockAsyncLocalStorage implements AsyncLocalStorageInterface {
    getStore(): any;
    run<T>(_store: any, callback: () => T): T;
    enterWith(_store: any): undefined;
}
declare class AsyncLocalStorageProvider {
    getInstance(): AsyncLocalStorageInterface;
    getRunnableConfig(): any;
    runWithConfig<T>(config: any, callback: () => T, avoidCreatingRootRunTree?: boolean): T;
    initializeGlobalInstance(instance: AsyncLocalStorageInterface): void;
}
declare const AsyncLocalStorageProviderSingleton: AsyncLocalStorageProvider;
export { AsyncLocalStorageProviderSingleton, type AsyncLocalStorageInterface };
