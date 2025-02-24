import { Tool } from "@langchain/core/tools";
export interface Headers {
    [key: string]: string;
}
/**
 * Interface for HTTP request tools. Contains properties for headers and
 * maximum output length.
 */
export interface RequestTool {
    headers: Headers;
    maxOutputLength: number;
}
/**
 * Class for making GET requests. Extends the Tool class and implements
 * the RequestTool interface. The input should be a URL string, and the
 * output will be the text response of the GET request.
 */
export declare class RequestsGetTool extends Tool implements RequestTool {
    headers: Headers;
    static lc_name(): string;
    name: string;
    maxOutputLength: number;
    constructor(headers?: Headers, { maxOutputLength }?: {
        maxOutputLength?: number;
    });
    /** @ignore */
    _call(input: string): Promise<string>;
    description: string;
}
/**
 * Class for making POST requests. Extends the Tool class and implements
 * the RequestTool interface. The input should be a JSON string with two
 * keys: 'url' and 'data'. The output will be the text response of the
 * POST request.
 */
export declare class RequestsPostTool extends Tool implements RequestTool {
    headers: Headers;
    static lc_name(): string;
    name: string;
    maxOutputLength: number;
    constructor(headers?: Headers, { maxOutputLength }?: {
        maxOutputLength?: number;
    });
    /** @ignore */
    _call(input: string): Promise<string>;
    description: string;
}
