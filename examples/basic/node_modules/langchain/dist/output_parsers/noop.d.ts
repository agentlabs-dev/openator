import { BaseOutputParser } from "@langchain/core/output_parsers";
/**
 * The NoOpOutputParser class is a type of output parser that does not
 * perform any operations on the output. It extends the BaseOutputParser
 * class and is part of the LangChain's output parsers module. This class
 * is useful in scenarios where the raw output of the Large Language
 * Models (LLMs) is required.
 */
export declare class NoOpOutputParser extends BaseOutputParser<string> {
    static lc_name(): string;
    lc_namespace: string[];
    lc_serializable: boolean;
    /**
     * This method takes a string as input and returns the same string as
     * output. It does not perform any operations on the input string.
     * @param text The input string to be parsed.
     * @returns The same input string without any operations performed on it.
     */
    parse(text: string): Promise<string>;
    /**
     * This method returns an empty string. It does not provide any formatting
     * instructions.
     * @returns An empty string, indicating no formatting instructions.
     */
    getFormatInstructions(): string;
}
