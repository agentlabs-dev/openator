"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRetrieverTool = void 0;
const zod_1 = require("zod");
const tools_1 = require("@langchain/core/tools");
const document_js_1 = require("../util/document.cjs");
function createRetrieverTool(retriever, input) {
    const func = async ({ query }, runManager) => {
        const docs = await retriever.getRelevantDocuments(query, runManager?.getChild("retriever"));
        return (0, document_js_1.formatDocumentsAsString)(docs);
    };
    const schema = zod_1.z.object({
        query: zod_1.z.string().describe("query to look up in retriever"),
    });
    return new tools_1.DynamicStructuredTool({ ...input, func, schema });
}
exports.createRetrieverTool = createRetrieverTool;
