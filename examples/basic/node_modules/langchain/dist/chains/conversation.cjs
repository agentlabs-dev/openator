"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationChain = exports.DEFAULT_TEMPLATE = void 0;
const prompts_1 = require("@langchain/core/prompts");
const llm_chain_js_1 = require("./llm_chain.cjs");
const buffer_memory_js_1 = require("../memory/buffer_memory.cjs");
exports.DEFAULT_TEMPLATE = `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
{history}
Human: {input}
AI:`;
/**
 * A class for conducting conversations between a human and an AI. It
 * extends the {@link LLMChain} class.
 * @example
 * ```typescript
 * const model = new ChatOpenAI({});
 * const chain = new ConversationChain({ llm: model });
 *
 * // Sending a greeting to the conversation chain
 * const res1 = await chain.call({ input: "Hi! I'm Jim." });
 * console.log({ res1 });
 *
 * // Following up with a question in the conversation
 * const res2 = await chain.call({ input: "What's my name?" });
 * console.log({ res2 });
 * ```
 */
class ConversationChain extends llm_chain_js_1.LLMChain {
    static lc_name() {
        return "ConversationChain";
    }
    constructor({ prompt, outputKey, memory, ...rest }) {
        super({
            prompt: prompt ??
                new prompts_1.PromptTemplate({
                    template: exports.DEFAULT_TEMPLATE,
                    inputVariables: ["history", "input"],
                }),
            outputKey: outputKey ?? "response",
            memory: memory ?? new buffer_memory_js_1.BufferMemory(),
            ...rest,
        });
    }
}
exports.ConversationChain = ConversationChain;
