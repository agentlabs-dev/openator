import { z } from "zod";
import { DynamicStructuredTool, } from "@langchain/core/tools";
import { formatDocumentsAsString } from "../../../util/document.js";
/** @deprecated Use "langchain/tools/retriever" instead. */
export function createRetrieverTool(retriever, input) {
    const func = async ({ input }, runManager) => {
        const docs = await retriever.getRelevantDocuments(input, runManager?.getChild("retriever"));
        return formatDocumentsAsString(docs);
    };
    const schema = z.object({
        input: z
            .string()
            .describe("Natural language query used as input to the retriever"),
    });
    return new DynamicStructuredTool({ ...input, func, schema });
}
