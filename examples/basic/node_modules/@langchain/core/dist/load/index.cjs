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
exports.load = void 0;
const serializable_js_1 = require("./serializable.cjs");
const import_constants_js_1 = require("./import_constants.cjs");
const coreImportMap = __importStar(require("./import_map.cjs"));
const map_keys_js_1 = require("./map_keys.cjs");
const env_js_1 = require("../utils/env.cjs");
function combineAliasesAndInvert(constructor) {
    const aliases = {};
    for (
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current = constructor; current && current.prototype; current = Object.getPrototypeOf(current)) {
        Object.assign(aliases, Reflect.get(current.prototype, "lc_aliases"));
    }
    return Object.entries(aliases).reduce((acc, [key, value]) => {
        acc[value] = key;
        return acc;
    }, {});
}
async function reviver(value) {
    const { optionalImportsMap = {}, optionalImportEntrypoints = [], importMap = {}, secretsMap = {}, path = ["$"], } = this;
    const pathStr = path.join(".");
    if (typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        "lc" in value &&
        "type" in value &&
        "id" in value &&
        value.lc === 1 &&
        value.type === "secret") {
        const serialized = value;
        const [key] = serialized.id;
        if (key in secretsMap) {
            return secretsMap[key];
        }
        else {
            const secretValueInEnv = (0, env_js_1.getEnvironmentVariable)(key);
            if (secretValueInEnv) {
                return secretValueInEnv;
            }
            else {
                throw new Error(`Missing key "${key}" for ${pathStr} in load(secretsMap={})`);
            }
        }
    }
    else if (typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        "lc" in value &&
        "type" in value &&
        "id" in value &&
        value.lc === 1 &&
        value.type === "not_implemented") {
        const serialized = value;
        const str = JSON.stringify(serialized);
        throw new Error(`Trying to load an object that doesn't implement serialization: ${pathStr} -> ${str}`);
    }
    else if (typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        "lc" in value &&
        "type" in value &&
        "id" in value &&
        "kwargs" in value &&
        value.lc === 1) {
        const serialized = value;
        const str = JSON.stringify(serialized);
        const [name, ...namespaceReverse] = serialized.id.slice().reverse();
        const namespace = namespaceReverse.reverse();
        const importMaps = { langchain_core: coreImportMap, langchain: importMap };
        let module = null;
        const optionalImportNamespaceAliases = [namespace.join("/")];
        if (namespace[0] === "langchain_community") {
            optionalImportNamespaceAliases.push(["langchain", ...namespace.slice(1)].join("/"));
        }
        const matchingNamespaceAlias = optionalImportNamespaceAliases.find((alias) => alias in optionalImportsMap);
        if (import_constants_js_1.optionalImportEntrypoints
            .concat(optionalImportEntrypoints)
            .includes(namespace.join("/")) ||
            matchingNamespaceAlias) {
            if (matchingNamespaceAlias !== undefined) {
                module = await optionalImportsMap[matchingNamespaceAlias];
            }
            else {
                throw new Error(`Missing key "${namespace.join("/")}" for ${pathStr} in load(optionalImportsMap={})`);
            }
        }
        else {
            let finalImportMap;
            // Currently, we only support langchain and langchain_core imports.
            if (namespace[0] === "langchain" || namespace[0] === "langchain_core") {
                finalImportMap = importMaps[namespace[0]];
                namespace.shift();
            }
            else {
                throw new Error(`Invalid namespace: ${pathStr} -> ${str}`);
            }
            // The root namespace "langchain" is not a valid import.
            if (namespace.length === 0) {
                throw new Error(`Invalid namespace: ${pathStr} -> ${str}`);
            }
            // Find the longest matching namespace.
            let importMapKey;
            do {
                importMapKey = namespace.join("__");
                if (importMapKey in finalImportMap) {
                    break;
                }
                else {
                    namespace.pop();
                }
            } while (namespace.length > 0);
            // If no matching namespace is found, throw an error.
            if (importMapKey in finalImportMap) {
                module = finalImportMap[importMapKey];
            }
        }
        if (typeof module !== "object" || module === null) {
            throw new Error(`Invalid namespace: ${pathStr} -> ${str}`);
        }
        // Extract the builder from the import map.
        const builder = 
        // look for a named export with the same name as the class
        module[name] ??
            // look for an export with a lc_name property matching the class name
            // this is necessary for classes that are minified
            Object.values(module).find((v) => typeof v === "function" &&
                (0, serializable_js_1.get_lc_unique_name)(v) === name);
        if (typeof builder !== "function") {
            throw new Error(`Invalid identifer: ${pathStr} -> ${str}`);
        }
        // Recurse on the arguments, which may be serialized objects themselves
        const kwargs = await reviver.call({ ...this, path: [...path, "kwargs"] }, serialized.kwargs);
        // Construct the object
        if (serialized.type === "constructor") {
            // eslint-disable-next-line new-cap, @typescript-eslint/no-explicit-any
            const instance = new builder((0, map_keys_js_1.mapKeys)(kwargs, map_keys_js_1.keyFromJson, combineAliasesAndInvert(builder)));
            // Minification in severless/edge runtimes will mange the
            // name of classes presented in traces. As the names in import map
            // are present as-is even with minification, use these names instead
            Object.defineProperty(instance.constructor, "name", { value: name });
            return instance;
        }
        else {
            throw new Error(`Invalid type: ${pathStr} -> ${str}`);
        }
    }
    else if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
            return Promise.all(value.map((v, i) => reviver.call({ ...this, path: [...path, `${i}`] }, v)));
        }
        else {
            return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([key, value]) => [
                key,
                await reviver.call({ ...this, path: [...path, key] }, value),
            ])));
        }
    }
    return value;
}
async function load(text, mappings) {
    const json = JSON.parse(text);
    return reviver.call({ ...mappings }, json);
}
exports.load = load;
