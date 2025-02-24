"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeFileStore = void 0;
const fs = __importStar(require("node:fs/promises"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const base_js_1 = require("./base.cjs");
/**
 * Specific implementation of the `BaseFileStore` class for Node.js.
 * Provides methods to read and write files in a specific base path.
 */
class NodeFileStore extends base_js_1.BaseFileStore {
    constructor(basePath = (0, node_fs_1.mkdtempSync)("langchain-")) {
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
        return await fs.readFile((0, node_path_1.join)(this.basePath, path), "utf8");
    }
    /**
     * Writes the given contents to a file at the specified path.
     * @param path Path of the file to write to.
     * @param contents Contents to write to the file.
     * @returns Promise that resolves when the file has been written.
     */
    async writeFile(path, contents) {
        await fs.writeFile((0, node_path_1.join)(this.basePath, path), contents, "utf8");
    }
}
exports.NodeFileStore = NodeFileStore;
