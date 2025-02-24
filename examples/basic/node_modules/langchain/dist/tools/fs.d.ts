import { z } from "zod";
import { StructuredTool, ToolParams } from "@langchain/core/tools";
import { BaseFileStore } from "../stores/file/base.js";
/**
 * Interface for parameters required by the ReadFileTool class.
 */
interface ReadFileParams extends ToolParams {
    store: BaseFileStore;
}
/**
 * Class for reading files from the disk. Extends the StructuredTool
 * class.
 */
export declare class ReadFileTool extends StructuredTool {
    static lc_name(): string;
    schema: z.ZodObject<{
        file_path: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        file_path: string;
    }, {
        file_path: string;
    }>;
    name: string;
    description: string;
    store: BaseFileStore;
    constructor({ store }: ReadFileParams);
    _call({ file_path }: z.infer<typeof this.schema>): Promise<string>;
}
/**
 * Interface for parameters required by the WriteFileTool class.
 */
interface WriteFileParams extends ToolParams {
    store: BaseFileStore;
}
/**
 * Class for writing data to files on the disk. Extends the StructuredTool
 * class.
 */
export declare class WriteFileTool extends StructuredTool {
    static lc_name(): string;
    schema: z.ZodObject<{
        file_path: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        file_path: string;
    }, {
        text: string;
        file_path: string;
    }>;
    name: string;
    description: string;
    store: BaseFileStore;
    constructor({ store, ...rest }: WriteFileParams);
    _call({ file_path, text }: z.infer<typeof this.schema>): Promise<string>;
}
export {};
