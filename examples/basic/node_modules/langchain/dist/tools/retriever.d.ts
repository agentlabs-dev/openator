import type { BaseRetrieverInterface } from "@langchain/core/retrievers";
import { z } from "zod";
import { DynamicStructuredTool, type DynamicStructuredToolInput } from "@langchain/core/tools";
export declare function createRetrieverTool(retriever: BaseRetrieverInterface, input: Omit<DynamicStructuredToolInput, "func" | "schema">): DynamicStructuredTool<z.ZodObject<{
    query: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query: string;
}, {
    query: string;
}>>;
