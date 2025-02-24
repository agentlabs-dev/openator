import type { BaseRetrieverInterface } from "@langchain/core/retrievers";
import { z } from "zod";
import { DynamicStructuredTool, DynamicStructuredToolInput } from "@langchain/core/tools";
/** @deprecated Use "langchain/tools/retriever" instead. */
export declare function createRetrieverTool(retriever: BaseRetrieverInterface, input: Omit<DynamicStructuredToolInput, "func" | "schema">): DynamicStructuredTool<z.ZodObject<{
    input: z.ZodString;
}, "strip", z.ZodTypeAny, {
    input: string;
}, {
    input: string;
}>>;
