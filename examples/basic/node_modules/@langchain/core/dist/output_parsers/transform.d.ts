import { BaseOutputParser } from "./base.js";
import { type BaseMessage } from "../messages/base.js";
import type { BaseCallbackConfig } from "../callbacks/manager.js";
import { type Generation, type ChatGeneration } from "../outputs.js";
/**
 * Class to parse the output of an LLM call that also allows streaming inputs.
 */
export declare abstract class BaseTransformOutputParser<T = unknown> extends BaseOutputParser<T> {
    _transform(inputGenerator: AsyncGenerator<string | BaseMessage>): AsyncGenerator<T>;
    /**
     * Transforms an asynchronous generator of input into an asynchronous
     * generator of parsed output.
     * @param inputGenerator An asynchronous generator of input.
     * @param options A configuration object.
     * @returns An asynchronous generator of parsed output.
     */
    transform(inputGenerator: AsyncGenerator<string | BaseMessage>, options: BaseCallbackConfig): AsyncGenerator<T>;
}
export type BaseCumulativeTransformOutputParserInput = {
    diff?: boolean;
};
/**
 * A base class for output parsers that can handle streaming input. It
 * extends the `BaseTransformOutputParser` class and provides a method for
 * converting parsed outputs into a diff format.
 */
export declare abstract class BaseCumulativeTransformOutputParser<T = unknown> extends BaseTransformOutputParser<T> {
    protected diff: boolean;
    constructor(fields?: BaseCumulativeTransformOutputParserInput);
    protected abstract _diff(prev: any | undefined, next: any): any;
    abstract parsePartialResult(generations: Generation[] | ChatGeneration[]): Promise<T | undefined>;
    _transform(inputGenerator: AsyncGenerator<string | BaseMessage>): AsyncGenerator<T>;
    getFormatInstructions(): string;
}
