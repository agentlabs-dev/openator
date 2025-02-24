import { RunnableSequence, RunnablePassthrough, } from "@langchain/core/runnables";
function isBaseRetriever(x) {
    return (!!x &&
        typeof x.getRelevantDocuments === "function");
}
/**
 * Create a retrieval chain that retrieves documents and then passes them on.
 * @param {CreateRetrievalChainParams} params A params object
 *     containing a retriever and a combineDocsChain.
 * @returns An LCEL Runnable which returns a an object
 *     containing at least `context` and `answer` keys.
 * @example
 * ```typescript
 * // yarn add langchain @langchain/openai
 *
 * import { ChatOpenAI } from "@langchain/openai";
 * import { pull } from "langchain/hub";
 * import { createRetrievalChain } from "langchain/chains/retrieval";
 * import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
 *
 * const retrievalQAChatPrompt = await pull("langchain-ai/retrieval-qa-chat");
 * const llm = new ChatOpenAI({});
 * const retriever = ...
 * const combineDocsChain = await createStuffDocumentsChain(...);
 * const retrievalChain = await createRetrievalChain({
 *   retriever,
 *   combineDocsChain,
 * });
 * const response = await chain.invoke({ input: "..." });
 * ```
 */
export async function createRetrievalChain({ retriever, combineDocsChain, }) {
    let retrieveDocumentsChain;
    if (isBaseRetriever(retriever)) {
        retrieveDocumentsChain = RunnableSequence.from([
            (input) => input.input,
            retriever,
        ]);
    }
    else {
        // TODO: Fix typing by adding withConfig to core RunnableInterface
        retrieveDocumentsChain = retriever;
    }
    const retrievalChain = RunnableSequence.from([
        RunnablePassthrough.assign({
            context: retrieveDocumentsChain.withConfig({
                runName: "retrieve_documents",
            }),
            chat_history: (input) => input.chat_history ?? [],
        }),
        RunnablePassthrough.assign({
            answer: combineDocsChain,
        }),
    ]).withConfig({ runName: "retrieval_chain" });
    return retrievalChain;
}
