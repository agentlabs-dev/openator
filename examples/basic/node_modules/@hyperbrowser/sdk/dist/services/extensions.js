"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionService = void 0;
const client_1 = require("../client");
const base_1 = require("./base");
const form_data_1 = __importDefault(require("form-data"));
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
async function checkFileExists(filePath) {
    try {
        await promises_1.default.access(filePath, promises_1.default.constants.R_OK);
        const extension = node_path_1.default.extname(filePath);
        if (extension !== ".zip") {
            throw new client_1.HyperbrowserError("Extension file provided is not zipped", undefined);
        }
    }
    catch (err) {
        if (err instanceof client_1.HyperbrowserError) {
            throw err;
        }
        throw new client_1.HyperbrowserError("Could not find extension file", undefined);
    }
}
class ExtensionService extends base_1.BaseService {
    /**
     * Upload an extension to hyperbrowser
     * @param params Configuration parameters for the new extension
     */
    async create(params) {
        try {
            await checkFileExists(params.filePath);
            const form = new form_data_1.default();
            form.append("file", await promises_1.default.readFile(params.filePath), {
                filename: node_path_1.default.basename(params.filePath),
                contentType: "application/zip",
            });
            if (params.name) {
                form.append("name", params.name);
            }
            const response = await this.request("/extensions/add", {
                method: "POST",
                body: form,
                headers: form.getHeaders(),
            });
            return response;
        }
        catch (error) {
            if (error instanceof client_1.HyperbrowserError) {
                throw error;
            }
            throw new client_1.HyperbrowserError("Failed to upload extension", undefined);
        }
    }
    /**
     * List all uploaded extensions for the account
     */
    async list() {
        try {
            return await this.request("/extensions/list", { method: "GET" });
        }
        catch (err) {
            if (err instanceof client_1.HyperbrowserError) {
                throw err;
            }
            else {
                throw new client_1.HyperbrowserError("Could not list extensions", undefined);
            }
        }
    }
}
exports.ExtensionService = ExtensionService;
