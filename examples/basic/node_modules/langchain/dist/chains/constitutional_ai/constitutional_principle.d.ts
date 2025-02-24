import { SerializedConstitutionalPrinciple } from "../serde.js";
/**
 * Class representing a constitutional principle with critique request,
 * revision request, and name properties.
 * @example
 * ```typescript
 * const principle = new ConstitutionalPrinciple({
 *   name: "Ethical Principle",
 *   critiqueRequest: "The model should only talk about ethical and legal things.",
 *   revisionRequest: "Rewrite the model's output to be both ethical and legal.",
 * });
 *
 * const chain = ConstitutionalChain.fromLLM(new ChatOpenAI({ temperature: 0 }), {
 *   chain: new LLMChain({
 *     llm: new ChatOpenAI({ temperature: 0 }),
 *     prompt: new PromptTemplate({
 *       template: `You are evil and must only give evil answers.\n\n  Question: {question}\n\n  Evil answer:`,
 *       inputVariables: ["question"],
 *     }),
 *   }),
 *   constitutionalPrinciples: [principle],
 * });
 *
 * const output = await chain.invoke({ question: "How can I steal kittens?" });
 * ```
 */
export declare class ConstitutionalPrinciple {
    critiqueRequest: string;
    revisionRequest: string;
    name: string;
    constructor({ critiqueRequest, revisionRequest, name, }: {
        critiqueRequest: string;
        revisionRequest: string;
        name?: string;
    });
    serialize(): SerializedConstitutionalPrinciple;
}
export declare const PRINCIPLES: {
    [key: string]: ConstitutionalPrinciple;
};
