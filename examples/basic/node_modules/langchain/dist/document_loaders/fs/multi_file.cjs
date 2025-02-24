"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiFileLoader = void 0;
const node_path_1 = require("node:path");
const promises_1 = require("node:fs/promises");
const base_js_1 = require("../base.cjs");
const directory_js_1 = require("./directory.cjs");
/**
 * A document loader that loads documents from multiple files. It extends the
 * `BaseDocumentLoader` class and implements the `load()` method.
 * @example
 * ```typescript
 *
 * const multiFileLoader = new MultiFileLoader(
 *   ["path/to/file1.pdf", "path/to/file2.txt"],
 *   {
 *     ".pdf": (path: string) => new PDFLoader(path),
 *   },
 * );
 *
 * const docs = await multiFileLoader.load();
 * console.log({ docs });
 *
 * ```
 */
class MultiFileLoader extends base_js_1.BaseDocumentLoader {
    constructor(filePaths, loaders, unknown = directory_js_1.UnknownHandling.Warn) {
        super();
        Object.defineProperty(this, "filePaths", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: filePaths
        });
        Object.defineProperty(this, "loaders", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: loaders
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
     * Loads the documents from the provided file paths. It checks if the file
     * is a directory and ignores it. If a file is a file, it checks if there
     * is a corresponding loader function for the file extension in the `loaders`
     * mapping. If there is, it loads the documents. If there is no
     * corresponding loader function and `unknown` is set to `Warn`, it logs a
     * warning message. If `unknown` is set to `Error`, it throws an error.
     * @returns A promise that resolves to an array of loaded documents.
     */
    async load() {
        const documents = [];
        for (const filePath of this.filePaths) {
            const fullPath = (0, node_path_1.resolve)(filePath);
            const fileStat = await (0, promises_1.stat)(fullPath);
            if (fileStat.isDirectory()) {
                console.warn(`Ignoring directory: ${fullPath}`);
                continue;
            }
            const loaderFactory = this.loaders[(0, node_path_1.extname)(fullPath)];
            if (loaderFactory) {
                const loader = loaderFactory(fullPath);
                documents.push(...(await loader.load()));
            }
            else {
                switch (this.unknown) {
                    case directory_js_1.UnknownHandling.Ignore:
                        break;
                    case directory_js_1.UnknownHandling.Warn:
                        console.warn(`Unknown file type: ${fullPath}`);
                        break;
                    case directory_js_1.UnknownHandling.Error:
                        throw new Error(`Unknown file type: ${fullPath}`);
                    default:
                        throw new Error(`Unknown unknown handling: ${this.unknown}`);
                }
            }
        }
        return documents;
    }
}
exports.MultiFileLoader = MultiFileLoader;
