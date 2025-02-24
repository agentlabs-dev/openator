import type { OptionalImportMap, SecretMap } from "./import_type.js";
export declare function load<T>(text: string, mappings?: {
    secretsMap?: SecretMap;
    optionalImportsMap?: OptionalImportMap;
    optionalImportEntrypoints?: string[];
    importMap?: Record<string, unknown>;
}): Promise<T>;
