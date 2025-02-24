/**
 * Formatting function definitions for calculating openai function defination token usage.
 *
 * https://github.com/hmarr/openai-chat-tokens/blob/main/src/functions.ts
 * (c) 2023 Harry Marr
 * MIT license
 */
import OpenAI from "openai";
type OpenAIFunction = OpenAI.Chat.ChatCompletionCreateParams.Function;
export interface FunctionDef extends Omit<OpenAIFunction, "parameters"> {
    name: string;
    description?: string;
    parameters: ObjectProp;
}
interface ObjectProp {
    type: "object";
    properties?: {
        [key: string]: Prop;
    };
    required?: string[];
}
interface AnyOfProp {
    anyOf: Prop[];
}
type Prop = {
    description?: string;
} & (AnyOfProp | ObjectProp | {
    type: "string";
    enum?: string[];
} | {
    type: "number" | "integer";
    minimum?: number;
    maximum?: number;
    enum?: number[];
} | {
    type: "boolean";
} | {
    type: "null";
} | {
    type: "array";
    items?: Prop;
});
export declare function formatFunctionDefinitions(functions: FunctionDef[]): string;
export {};
