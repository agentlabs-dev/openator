import { type ClientOptions } from "openai";
import { type BaseLLMParams } from "@langchain/core/language_models/llms";
import { OpenAI } from "../llms.js";
import type { OpenAIInput, AzureOpenAIInput, OpenAICoreRequestOptions } from "../types.js";
export declare class AzureOpenAI extends OpenAI {
    azureOpenAIApiVersion?: string;
    azureOpenAIApiKey?: string;
    azureADTokenProvider?: () => Promise<string>;
    azureOpenAIApiInstanceName?: string;
    azureOpenAIApiDeploymentName?: string;
    azureOpenAIBasePath?: string;
    azureOpenAIEndpoint?: string;
    get lc_aliases(): Record<string, string>;
    get lc_secrets(): {
        [key: string]: string;
    } | undefined;
    constructor(fields?: Partial<OpenAIInput> & {
        openAIApiKey?: string;
        openAIApiVersion?: string;
        openAIBasePath?: string;
        deploymentName?: string;
    } & Partial<AzureOpenAIInput> & BaseLLMParams & {
        configuration?: ClientOptions;
    });
    protected _getClientOptions(options: OpenAICoreRequestOptions | undefined): OpenAICoreRequestOptions;
    toJSON(): any;
}
