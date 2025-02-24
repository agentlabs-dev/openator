"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRetrieverTool = void 0;
const zod_1 = require("zod");
const tools_1 = require("@langchain/core/tools");
const document_js_1 = require("../../../util/document.cjs");
/** @deprecated Use "langchain/tools/retriever" instead. */
function createRetrieverTool(retriever, input) {
    const func = async ({ input }, runManager) => {
        const docs = await retriever.getRelevantDocuments(input, runManager?.getChild("retriever"));
        return (0, document_js_1.formatDocumentsAsString)(docs);
    };
    const schema = zod_1.z.object({
        input: zod_1.z
            .string()
            .describe("Natural language query used as input to the retriever"),
    });
    return new tools_1.DynamicStructuredTool({ ...input, func, schema });
}
exports.createRetrieverTool = createRetrieverTool;
