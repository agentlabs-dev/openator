"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryFileStore = void 0;
const base_js_1 = require("./base.cjs");
/**
 * Class that provides an in-memory file storage system. It extends the
 * BaseFileStore class and implements its readFile and writeFile methods.
 * This class is typically used in scenarios where temporary, in-memory
 * file storage is needed, such as during testing or for caching files in
 * memory for quick access.
 */
class InMemoryFileStore extends base_js_1.BaseFileStore {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "stores", "file", "in_memory"]
        });
        Object.defineProperty(this, "files", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * Retrieves the contents of a file given its path. If the file does not
     * exist, it throws an error.
     * @param path The path of the file to read.
     * @returns The contents of the file as a string.
     */
    async readFile(path) {
        const contents = this.files.get(path);
        if (contents === undefined) {
            throw new Error(`File not found: ${path}`);
        }
        return contents;
    }
    /**
     * Writes contents to a file at a given path. If the file already exists,
     * it overwrites the existing contents.
     * @param path The path of the file to write.
     * @param contents The contents to write to the file.
     * @returns Void
     */
    async writeFile(path, contents) {
        this.files.set(path, contents);
    }
}
exports.InMemoryFileStore = InMemoryFileStore;
