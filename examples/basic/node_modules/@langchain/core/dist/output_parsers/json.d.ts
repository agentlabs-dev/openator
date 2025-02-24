import { BaseCumulativeTransformOutputParser } from "./transform.js";
import { Operation } from "../utils/json_patch.js";
import { ChatGeneration, Generation } from "../outputs.js";
import { parseJsonMarkdown, parsePartialJson } from "../utils/json.js";
/**
 * Class for parsing the output of an LLM into a JSON object.
 */
export declare class JsonOutputParser<T extends Record<string, any> = Record<string, any>> extends BaseCumulativeTransformOutputParser<T> {
    static lc_name(): string;
    lc_namespace: string[];
    lc_serializable: boolean;
    protected _diff(prev: unknown | undefined, next: unknown): Operation[] | undefined;
    parsePartialResult(generations: ChatGeneration[] | Generation[]): Promise<T | undefined>;
    parse(text: string): Promise<T>;
    getFormatInstructions(): string;
}
export { parsePartialJson, parseJsonMarkdown };
