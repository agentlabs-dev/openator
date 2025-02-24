import * as fs from "node:fs/promises";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { BaseFileStore } from "./base.js";
/**
 * Specific implementation of the `BaseFileStore` class for Node.js.
 * Provides methods to read and write files in a specific base path.
 */
export class NodeFileStore extends BaseFileStore {
    constructor(basePath = mkdtempSync("langchain-")) {
        super();
        Object.defineProperty(this, "basePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: basePath
        });
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "stores", "file", "node"]
        });
    }
    /**
     * Reads the contents of a file at the given path.
     * @param path Path of the file to read.
     * @returns The contents of the file as a string.
     */
    async readFile(path) {
        return await fs.readFile(join(this.basePath, path), "utf8");
    }
    /**
     * Writes the given contents to a file at the specified path.
     * @param path Path of the file to write to.
     * @param contents Contents to write to the file.
     * @returns Promise that resolves when the file has been written.
     */
    async writeFile(path, contents) {
        await fs.writeFile(join(this.basePath, path), contents, "utf8");
    }
}
