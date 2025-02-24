import { OpenAI as OpenAIClient } from "openai";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { convertToOpenAIFunction, convertToOpenAITool } from "@langchain/core/utils/function_calling";
export declare function wrapOpenAIClientError(e: any): any;
export { convertToOpenAIFunction as formatToOpenAIFunction, convertToOpenAITool as formatToOpenAITool, };
export declare function formatToOpenAIAssistantTool(tool: StructuredToolInterface): {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: import("zod-to-json-schema").JsonSchema7Type & {
            $schema?: string | undefined;
            definitions?: {
                [key: string]: import("zod-to-json-schema").JsonSchema7Type;
            } | undefined;
        };
    };
};
export type OpenAIToolChoice = OpenAIClient.ChatCompletionToolChoiceOption | "any" | string;
export declare function formatToOpenAIToolChoice(toolChoice?: OpenAIToolChoice): OpenAIClient.ChatCompletionToolChoiceOption | undefined;
