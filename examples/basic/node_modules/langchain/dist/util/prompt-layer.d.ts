import type { OpenAI as OpenAIClient } from "openai";
import { AsyncCaller } from "@langchain/core/utils/async_caller";
export declare const promptLayerTrackRequest: (callerFunc: AsyncCaller, functionName: string, kwargs: OpenAIClient.CompletionCreateParams | OpenAIClient.Chat.CompletionCreateParams, plTags: string[] | undefined, requestResponse: any, startTime: number, endTime: number, apiKey: string | undefined) => Promise<any>;
