import { ChainValues } from "@langchain/core/utils/types";
import { CallbackManagerForChainRun } from "@langchain/core/callbacks/manager";
import { BaseChain, ChainInputs } from "./base.js";
import { TextSplitter } from "../text_splitter.js";
import { SerializedAnalyzeDocumentChain } from "./serde.js";
export type LoadValues = Record<string, any>;
/**
 * Interface for the input parameters required by the AnalyzeDocumentChain
 * class.
 */
export interface AnalyzeDocumentChainInput extends Omit<ChainInputs, "memory"> {
    combineDocumentsChain: BaseChain;
    textSplitter?: TextSplitter;
    inputKey?: string;
}
/**
 * Chain that combines documents by stuffing into context.
 * @augments BaseChain
 * @augments StuffDocumentsChainInput
 * @example
 * ```typescript
 * const model = new ChatOpenAI({ temperature: 0 });
 * const combineDocsChain = loadSummarizationChain(model);
 * const chain = new AnalyzeDocumentChain({
 *   combineDocumentsChain: combineDocsChain,
 * });
 *
 * // Read the text from a file (this is a placeholder for actual file reading)
 * const text = readTextFromFile("state_of_the_union.txt");
 *
 * // Invoke the chain to analyze the document
 * const res = await chain.call({
 *   input_document: text,
 * });
 *
 * console.log({ res });
 * ```
 */
export declare class AnalyzeDocumentChain extends BaseChain implements AnalyzeDocumentChainInput {
    static lc_name(): string;
    inputKey: string;
    combineDocumentsChain: BaseChain;
    textSplitter: TextSplitter;
    constructor(fields: AnalyzeDocumentChainInput);
    get inputKeys(): string[];
    get outputKeys(): string[];
    /** @ignore */
    _call(values: ChainValues, runManager?: CallbackManagerForChainRun): Promise<ChainValues>;
    _chainType(): "analyze_document_chain";
    static deserialize(data: SerializedAnalyzeDocumentChain, values: LoadValues): Promise<AnalyzeDocumentChain>;
    serialize(): SerializedAnalyzeDocumentChain;
}
