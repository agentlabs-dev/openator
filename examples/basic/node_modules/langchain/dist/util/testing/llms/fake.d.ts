import { GenerationChunk } from "@langchain/core/outputs";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { LLM, BaseLLMParams } from "@langchain/core/language_models/llms";
/**
 * Interface for the input parameters specific to the Fake List model.
 */
export interface FakeListInput extends BaseLLMParams {
    /** Responses to return */
    responses: string[];
    /** Time to sleep in milliseconds between responses */
    sleep?: number;
}
/**
 * A fake LLM that returns a predefined list of responses. It can be used for
 * testing purposes.
 */
export declare class FakeListLLM extends LLM {
    static lc_name(): string;
    responses: string[];
    i: number;
    sleep?: number;
    constructor({ responses, sleep }: FakeListInput);
    _llmType(): string;
    _call(_prompt: string, _options: this["ParsedCallOptions"], _runManager?: CallbackManagerForLLMRun): Promise<string>;
    _currentResponse(): string;
    _incrementResponse(): void;
    _streamResponseChunks(_input: string, _options: this["ParsedCallOptions"], _runManager?: CallbackManagerForLLMRun): AsyncGenerator<GenerationChunk>;
    _sleepIfRequested(): Promise<void>;
    _sleep(): Promise<void>;
    _createResponseChunk(text: string): GenerationChunk;
}
