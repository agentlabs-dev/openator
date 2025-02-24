import { LLMChain, LLMChainInput } from "./llm_chain.js";
import { Optional } from "../types/type-utils.js";
export declare const DEFAULT_TEMPLATE = "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.\n\nCurrent conversation:\n{history}\nHuman: {input}\nAI:";
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
export declare class ConversationChain extends LLMChain {
    static lc_name(): string;
    constructor({ prompt, outputKey, memory, ...rest }: Optional<LLMChainInput, "prompt">);
}
