import { BaseOutputParser } from "@langchain/core/output_parsers";
/**
 * Class to parse the output of an LLM call to a date.
 * @augments BaseOutputParser
 */
export declare class DatetimeOutputParser extends BaseOutputParser<Date> {
    static lc_name(): string;
    lc_namespace: string[];
    lc_serializable: boolean;
    /**
     * ISO 8601 date time standard.
     */
    format: string;
    /**
     * Parses the given text into a Date.
     * If the parsing fails, throws an OutputParserException.
     * @param text The text to parse.
     * @returns A date object.
     */
    parse(text: string): Promise<Date>;
    /**
     * Provides instructions on the expected format of the response for the
     * CommaSeparatedListOutputParser.
     * @returns A string containing instructions on the expected format of the response.
     */
    getFormatInstructions(): string;
}
