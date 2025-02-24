import { BaseTransformOutputParser } from "./transform.js";
/**
 * OutputParser that parses LLMResult into the top likely string and
 * encodes it into bytes.
 */
export declare class BytesOutputParser extends BaseTransformOutputParser<Uint8Array> {
    static lc_name(): string;
    lc_namespace: string[];
    lc_serializable: boolean;
    protected textEncoder: any;
    parse(text: string): Promise<Uint8Array>;
    getFormatInstructions(): string;
}
