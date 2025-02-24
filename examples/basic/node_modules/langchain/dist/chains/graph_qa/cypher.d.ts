import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { ChainValues } from "@langchain/core/utils/types";
import { BasePromptTemplate } from "@langchain/core/prompts";
import { CallbackManagerForChainRun } from "@langchain/core/callbacks/manager";
import { LLMChain } from "../llm_chain.js";
import { BaseChain, ChainInputs } from "../base.js";
export declare const INTERMEDIATE_STEPS_KEY = "intermediateSteps";
export interface GraphCypherQAChainInput extends ChainInputs {
    graph: any;
    cypherGenerationChain: LLMChain;
    qaChain: LLMChain;
    inputKey?: string;
    outputKey?: string;
    topK?: number;
    returnIntermediateSteps?: boolean;
    returnDirect?: boolean;
}
export interface FromLLMInput {
    graph: any;
    llm?: BaseLanguageModelInterface;
    cypherLLM?: BaseLanguageModelInterface;
    qaLLM?: BaseLanguageModelInterface;
    qaPrompt?: BasePromptTemplate;
    cypherPrompt?: BasePromptTemplate;
    returnIntermediateSteps?: boolean;
    returnDirect?: boolean;
}
/**
 * Chain for question-answering against a graph by generating Cypher statements.
 *
 * @example
 * ```typescript
 * const chain = new GraphCypherQAChain({
 *   llm: new ChatOpenAI({ temperature: 0 }),
 *   graph: new Neo4jGraph(),
 * });
 * const res = await chain.invoke("Who played in Pulp Fiction?");
 * ```
 *
 * @security
 * This chain will execute Cypher statements against the provided database.
 * Make sure that the database connection uses credentials
 * that are narrowly-scoped to only include necessary permissions.
 * Failure to do so may result in data corruption or loss, since the calling code
 * may attempt commands that would result in deletion, mutation of data
 * if appropriately prompted or reading sensitive data if such data is present in the database.
 * The best way to guard against such negative outcomes is to (as appropriate) limit the
 * permissions granted to the credentials used with this tool.
 *
 * See https://js.langchain.com/docs/security for more information.
 */
export declare class GraphCypherQAChain extends BaseChain {
    private graph;
    private cypherGenerationChain;
    private qaChain;
    private inputKey;
    private outputKey;
    private topK;
    private returnDirect;
    private returnIntermediateSteps;
    constructor(props: GraphCypherQAChainInput);
    _chainType(): "graph_cypher_chain";
    get inputKeys(): string[];
    get outputKeys(): string[];
    static fromLLM(props: FromLLMInput): GraphCypherQAChain;
    private extractCypher;
    _call(values: ChainValues, runManager?: CallbackManagerForChainRun): Promise<ChainValues>;
}
