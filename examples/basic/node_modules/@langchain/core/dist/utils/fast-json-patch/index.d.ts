export * from "./src/core.js";
export * from "./src/duplex.js";
export { PatchError as JsonPatchError, _deepClone as deepClone, escapePathComponent, unescapePathComponent, } from "./src/helpers.js";
/**
 * Default export for backwards compat
 */
import * as core from "./src/core.js";
import { PatchError as JsonPatchError, _deepClone as deepClone, escapePathComponent, unescapePathComponent } from "./src/helpers.js";
declare const _default: {
    JsonPatchError: typeof JsonPatchError;
    deepClone: typeof deepClone;
    escapePathComponent: typeof escapePathComponent;
    unescapePathComponent: typeof unescapePathComponent;
    getValueByPointer(document: any, pointer: string): any;
    applyOperation<T>(document: T, operation: core.Operation, validateOperation?: boolean | core.Validator<T>, mutateDocument?: boolean, banPrototypeModifications?: boolean, index?: number): core.OperationResult<T>;
    applyPatch<T_1>(document: T_1, patch: readonly core.Operation[], validateOperation?: boolean | core.Validator<T_1> | undefined, mutateDocument?: boolean, banPrototypeModifications?: boolean): core.PatchResult<T_1>;
    applyReducer<T_2>(document: T_2, operation: core.Operation, index: number): T_2;
    validator(operation: core.Operation, index: number, document?: any, existingPathFragment?: string | undefined): void;
    validate<T_3>(sequence: readonly core.Operation[], document?: T_3 | undefined, externalValidator?: core.Validator<T_3> | undefined): JsonPatchError;
    _areEquals(a: any, b: any): boolean;
};
export default _default;
