import { Callbacks } from "@langchain/core/callbacks/manager";
import { BaseOutputParser } from "@langchain/core/output_parsers";
/**
 * Type for the combined output of the CombiningOutputParser class.
 */
export type CombinedOutput = Record<string, any>;
/**
 * Interface for the fields required by the CombiningOutputParser class.
 */
export interface CombiningOutputParserFields {
    parsers: BaseOutputParser[];
}
/**
 * Class to combine multiple output parsers
 * @augments BaseOutputParser
 */
export declare class CombiningOutputParser extends BaseOutputParser<object> {
    static lc_name(): string;
    lc_namespace: string[];
    lc_serializable: boolean;
    parsers: BaseOutputParser[];
    outputDelimiter: string;
    constructor(fields: CombiningOutputParserFields);
    constructor(...parsers: BaseOutputParser[]);
    /**
     * Method to parse an input string using the parsers in the parsers array.
     * The parsed outputs are combined into a single object and returned.
     * @param input The input string to parse.
     * @param callbacks Optional Callbacks object.
     * @returns A Promise that resolves to a CombinedOutput object.
     */
    parse(input: string, callbacks?: Callbacks): Promise<CombinedOutput>;
    /**
     * Method to get instructions on how to format the LLM output. The
     * instructions are based on the parsers array and the outputDelimiter.
     * @returns A string with format instructions.
     */
    getFormatInstructions(): string;
}
