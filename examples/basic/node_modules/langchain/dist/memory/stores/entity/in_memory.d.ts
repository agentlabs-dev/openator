import { BaseEntityStore } from "./base.js";
/**
 * An entity store that keeps data in memory. It extends from the
 * `BaseEntityStore` class and is used to store and manage entities.
 */
export declare class InMemoryEntityStore extends BaseEntityStore {
    lc_namespace: string[];
    private store;
    constructor();
    /**
     * Retrieves the value associated with the given key from the store. If
     * the key does not exist in the store, it returns the provided default
     * value.
     * @param key The key to retrieve the value for.
     * @param defaultValue The default value to return if the key does not exist in the store.
     * @returns The value associated with the key, or the default value if the key does not exist in the store.
     */
    get(key: string, defaultValue: string | undefined): Promise<string | undefined>;
    /**
     * Sets the value associated with the given key in the store.
     * @param key The key to set the value for.
     * @param value The value to set.
     */
    set(key: string, value: string | undefined): Promise<void>;
    /**
     * Removes the key and its associated value from the store.
     * @param key The key to remove.
     */
    delete(key: string): Promise<void>;
    /**
     * Checks if a key exists in the store.
     * @param key The key to check.
     * @returns A boolean indicating whether the key exists in the store.
     */
    exists(key: string): Promise<boolean>;
    /**
     * Removes all keys and their associated values from the store.
     */
    clear(): Promise<void>;
}
