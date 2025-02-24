"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiRetrievalQAChain = void 0;
const zod_1 = require("zod");
const prompts_1 = require("@langchain/core/prompts");
const multi_route_js_1 = require("./multi_route.cjs");
const llm_router_js_1 = require("./llm_router.cjs");
const conversation_js_1 = require("../../chains/conversation.cjs");
const multi_retrieval_prompt_js_1 = require("./multi_retrieval_prompt.cjs");
const utils_js_1 = require("./utils.cjs");
const retrieval_qa_js_1 = require("../../chains/retrieval_qa.cjs");
const router_js_1 = require("../../output_parsers/router.cjs");
/**
 * A class that represents a multi-retrieval question answering chain in
 * the LangChain framework. It extends the MultiRouteChain class and
 * provides additional functionality specific to multi-retrieval QA
 * chains.
 * @example
 * ```typescript
 * const multiRetrievalQAChain = MultiRetrievalQAChain.fromLLMAndRetrievers(
 *   new ChatOpenAI(),
 *   {
 *     retrieverNames: ["aqua teen", "mst3k", "animaniacs"],
 *     retrieverDescriptions: [
 *       "Good for answering questions about Aqua Teen Hunger Force theme song",
 *       "Good for answering questions about Mystery Science Theater 3000 theme song",
 *       "Good for answering questions about Animaniacs theme song",
 *     ],
 *     retrievers: [
 *       new MemoryVectorStore().asRetriever(3),
 *       new MemoryVectorStore().asRetriever(3),
 *       new MemoryVectorStore().asRetriever(3),
 *     ],
 *     retrievalQAChainOpts: {
 *       returnSourceDocuments: true,
 *     },
 *   },
 * );
 *
 * const result = await multiRetrievalQAChain.call({
 *   input:
 *     "In the Aqua Teen Hunger Force theme song, who calls himself the mike rula?",
 * });
 *
 * console.log(result.sourceDocuments, result.text);
 * ```
 */
class MultiRetrievalQAChain extends multi_route_js_1.MultiRouteChain {
    get outputKeys() {
        return ["result"];
    }
    /**
     * @deprecated Use `fromRetrieversAndPrompts` instead
     */
    static fromRetrievers(llm, retrieverNames, retrieverDescriptions, retrievers, retrieverPrompts, defaults, options) {
        return MultiRetrievalQAChain.fromLLMAndRetrievers(llm, {
            retrieverNames,
            retrieverDescriptions,
            retrievers,
            retrieverPrompts,
            defaults,
            multiRetrievalChainOpts: options,
        });
    }
    /**
     * A static method that creates an instance of MultiRetrievalQAChain from
     * a BaseLanguageModel and a set of retrievers. It takes in optional
     * parameters for the retriever names, descriptions, prompts, defaults,
     * and additional options. It is an alternative method to fromRetrievers
     * and provides more flexibility in configuring the underlying chains.
     * @param llm A BaseLanguageModel instance.
     * @param retrieverNames An array of retriever names.
     * @param retrieverDescriptions An array of retriever descriptions.
     * @param retrievers An array of BaseRetrieverInterface instances.
     * @param retrieverPrompts An optional array of PromptTemplate instances for the retrievers.
     * @param defaults An optional MultiRetrievalDefaults instance.
     * @param multiRetrievalChainOpts Additional optional parameters for the multi-retrieval chain.
     * @param retrievalQAChainOpts Additional optional parameters for the retrieval QA chain.
     * @returns A new instance of MultiRetrievalQAChain.
     */
    static fromLLMAndRetrievers(llm, { retrieverNames, retrieverDescriptions, retrievers, retrieverPrompts, defaults, multiRetrievalChainOpts, retrievalQAChainOpts, }) {
        const { defaultRetriever, defaultPrompt, defaultChain } = defaults ?? {};
        if (defaultPrompt && !defaultRetriever) {
            throw new Error("`default_retriever` must be specified if `default_prompt` is \nprovided. Received only `default_prompt`.");
        }
        const destinations = (0, utils_js_1.zipEntries)(retrieverNames, retrieverDescriptions).map(([name, desc]) => `${name}: ${desc}`);
        const structuredOutputParserSchema = zod_1.z.object({
            destination: zod_1.z
                .string()
                .optional()
                .describe('name of the question answering system to use or "DEFAULT"'),
            next_inputs: zod_1.z
                .object({
                query: zod_1.z
                    .string()
                    .describe("a potentially modified version of the original input"),
            })
                .describe("input to be fed to the next model"),
        });
        const outputParser = new router_js_1.RouterOutputParser(structuredOutputParserSchema);
        const destinationsStr = destinations.join("\n");
        const routerTemplate = (0, prompts_1.interpolateFString)((0, multi_retrieval_prompt_js_1.STRUCTURED_MULTI_RETRIEVAL_ROUTER_TEMPLATE)(outputParser.getFormatInstructions({ interpolationDepth: 4 })), {
            destinations: destinationsStr,
        });
        const routerPrompt = new prompts_1.PromptTemplate({
            template: routerTemplate,
            inputVariables: ["input"],
            outputParser,
        });
        const routerChain = llm_router_js_1.LLMRouterChain.fromLLM(llm, routerPrompt);
        const prompts = retrieverPrompts ?? retrievers.map(() => null);
        const destinationChains = (0, utils_js_1.zipEntries)(retrieverNames, retrievers, prompts).reduce((acc, [name, retriever, prompt]) => {
            const opt = retrievalQAChainOpts ?? {};
            if (prompt) {
                opt.prompt = prompt;
            }
            acc[name] = retrieval_qa_js_1.RetrievalQAChain.fromLLM(llm, retriever, opt);
            return acc;
        }, {});
        let _defaultChain;
        if (defaultChain) {
            _defaultChain = defaultChain;
        }
        else if (defaultRetriever) {
            _defaultChain = retrieval_qa_js_1.RetrievalQAChain.fromLLM(llm, defaultRetriever, {
                ...retrievalQAChainOpts,
                prompt: defaultPrompt,
            });
        }
        else {
            const promptTemplate = conversation_js_1.DEFAULT_TEMPLATE.replace("input", "query");
            const prompt = new prompts_1.PromptTemplate({
                template: promptTemplate,
                inputVariables: ["history", "query"],
            });
            _defaultChain = new conversation_js_1.ConversationChain({
                llm,
                prompt,
                outputKey: "result",
            });
        }
        return new MultiRetrievalQAChain({
            ...multiRetrievalChainOpts,
            routerChain,
            destinationChains,
            defaultChain: _defaultChain,
        });
    }
    _chainType() {
        return "multi_retrieval_qa_chain";
    }
}
exports.MultiRetrievalQAChain = MultiRetrievalQAChain;
