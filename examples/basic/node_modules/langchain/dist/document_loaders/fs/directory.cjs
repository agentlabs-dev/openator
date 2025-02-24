"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryLoader = exports.UnknownHandling = void 0;
const env_1 = require("@langchain/core/utils/env");
const base_js_1 = require("../base.cjs");
// TypeScript enums are not tree-shakeable, so doing this instead
// See https://bargsten.org/jsts/enums/
exports.UnknownHandling = {
    Ignore: "ignore",
    Warn: "warn",
    Error: "error",
};
/**
 * A document loader that loads documents from a directory. It extends the
 * `BaseDocumentLoader` class and implements the `load()` method.
 * @example
 * ```typescript
 *
 * const directoryLoader = new DirectoryLoader(
 *   "src/document_loaders/example_data/",
 *   {
 *     ".pdf": (path: string) => new PDFLoader(path),
 *   },
 * );
 *
 * const docs = await directoryLoader.load();
 * console.log({ docs });
 *
 * ```
 */
class DirectoryLoader extends base_js_1.BaseDocumentLoader {
    constructor(directoryPath, loaders, recursive = true, unknown = exports.UnknownHandling.Warn) {
        super();
        Object.defineProperty(this, "directoryPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: directoryPath
        });
        Object.defineProperty(this, "loaders", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: loaders
        });
        Object.defineProperty(this, "recursive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: recursive
        });
        Object.defineProperty(this, "unknown", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: unknown
        });
        if (Object.keys(loaders).length === 0) {
            throw new Error("Must provide at least one loader");
        }
        for (const extension in loaders) {
            if (Object.hasOwn(loaders, extension)) {
                if (extension[0] !== ".") {
                    throw new Error(`Extension must start with a dot: ${extension}`);
                }
            }
        }
    }
    /**
     * Loads the documents from the directory. If a file is a directory and
     * `recursive` is `true`, it recursively loads documents from the
     * subdirectory. If a file is a file, it checks if there is a
     * corresponding loader function for the file extension in the `loaders`
     * mapping. If there is, it loads the documents. If there is no
     * corresponding loader function and `unknown` is set to `Warn`, it logs a
     * warning message. If `unknown` is set to `Error`, it throws an error.
     * @returns A promise that resolves to an array of loaded documents.
     */
    async load() {
        const { readdir, extname, resolve } = await DirectoryLoader.imports();
        const files = await readdir(this.directoryPath, { withFileTypes: true });
        const documents = [];
        for (const file of files) {
            const fullPath = resolve(this.directoryPath, file.name);
            if (file.isDirectory()) {
                if (this.recursive) {
                    const loader = new DirectoryLoader(fullPath, this.loaders, this.recursive, this.unknown);
                    documents.push(...(await loader.load()));
                }
            }
            else {
                // I'm aware some things won't be files,
                // but they will be caught by the "unknown" handling below.
                const loaderFactory = this.loaders[extname(file.name)];
                if (loaderFactory) {
                    const loader = loaderFactory(fullPath);
                    documents.push(...(await loader.load()));
                }
                else {
                    switch (this.unknown) {
                        case exports.UnknownHandling.Ignore:
                            break;
                        case exports.UnknownHandling.Warn:
                            console.warn(`Unknown file type: ${file.name}`);
                            break;
                        case exports.UnknownHandling.Error:
                            throw new Error(`Unknown file type: ${file.name}`);
                        default:
                            throw new Error(`Unknown unknown handling: ${this.unknown}`);
                    }
                }
            }
        }
        return documents;
    }
    /**
     * Imports the necessary functions from the `node:path` and
     * `node:fs/promises` modules. It is used to dynamically import the
     * functions when needed. If the import fails, it throws an error
     * indicating that the modules failed to load.
     * @returns A promise that resolves to an object containing the imported functions.
     */
    static async imports() {
        try {
            const { extname, resolve } = await import("node:path");
            const { readdir } = await import("node:fs/promises");
            return { readdir, extname, resolve };
        }
        catch (e) {
            console.error(e);
            throw new Error(`Failed to load fs/promises. DirectoryLoader available only on environment 'node'. It appears you are running environment '${(0, env_1.getEnv)()}'. See https://<link to docs> for alternatives.`);
        }
    }
}
exports.DirectoryLoader = DirectoryLoader;
