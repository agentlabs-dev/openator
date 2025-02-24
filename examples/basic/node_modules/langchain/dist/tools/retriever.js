import { z } from "zod";
import { DynamicStructuredTool, } from "@langchain/core/tools";
import { formatDocumentsAsString } from "../util/document.js";
export function createRetrieverTool(retriever, input) {
    const func = async ({ query }, runManager) => {
        const docs = await retriever.getRelevantDocuments(query, runManager?.getChild("retriever"));
        return formatDocumentsAsString(docs);
    };
    const schema = z.object({
        query: z.string().describe("query to look up in retriever"),
    });
    return new DynamicStructuredTool({ ...input, func, schema });
}
