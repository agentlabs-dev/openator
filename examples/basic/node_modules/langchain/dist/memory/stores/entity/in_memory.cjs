"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryEntityStore = void 0;
const base_js_1 = require("./base.cjs");
/**
 * An entity store that keeps data in memory. It extends from the
 * `BaseEntityStore` class and is used to store and manage entities.
 */
class InMemoryEntityStore extends base_js_1.BaseEntityStore {
    constructor() {
        super();
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "stores", "entity", "in_memory"]
        });
        Object.defineProperty(this, "store", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.store = Object.create(null);
    }
    /**
     * Retrieves the value associated with the given key from the store. If
     * the key does not exist in the store, it returns the provided default
     * value.
     * @param key The key to retrieve the value for.
     * @param defaultValue The default value to return if the key does not exist in the store.
     * @returns The value associated with the key, or the default value if the key does not exist in the store.
     */
    async get(key, defaultValue) {
        return key in this.store ? this.store[key] : defaultValue;
    }
    /**
     * Sets the value associated with the given key in the store.
     * @param key The key to set the value for.
     * @param value The value to set.
     */
    async set(key, value) {
        this.store[key] = value;
    }
    /**
     * Removes the key and its associated value from the store.
     * @param key The key to remove.
     */
    async delete(key) {
        delete this.store[key];
    }
    /**
     * Checks if a key exists in the store.
     * @param key The key to check.
     * @returns A boolean indicating whether the key exists in the store.
     */
    async exists(key) {
        return key in this.store;
    }
    /**
     * Removes all keys and their associated values from the store.
     */
    async clear() {
        this.store = Object.create(null);
    }
}
exports.InMemoryEntityStore = InMemoryEntityStore;
