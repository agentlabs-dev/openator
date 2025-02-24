import { OpenAI } from "openai";
import type { APIPromise } from "openai/core";
import type { RunTreeConfig } from "../index.js";
type OpenAIType = {
    beta?: {
        chat?: {
            completions?: {
                parse?: (...args: any[]) => any;
            };
        };
    };
    chat: {
        completions: {
            create: (...args: any[]) => any;
        };
    };
    completions: {
        create: (...args: any[]) => any;
    };
};
type ExtraRunTreeConfig = Pick<Partial<RunTreeConfig>, "name" | "metadata" | "tags">;
type PatchedOpenAIClient<T extends OpenAIType> = T & {
    chat: T["chat"] & {
        completions: T["chat"]["completions"] & {
            create: {
                (arg: OpenAI.ChatCompletionCreateParamsStreaming, arg2?: OpenAI.RequestOptions & {
                    langsmithExtra?: ExtraRunTreeConfig;
                }): APIPromise<AsyncGenerator<OpenAI.ChatCompletionChunk>>;
            } & {
                (arg: OpenAI.ChatCompletionCreateParamsNonStreaming, arg2?: OpenAI.RequestOptions & {
                    langsmithExtra?: ExtraRunTreeConfig;
                }): APIPromise<OpenAI.ChatCompletionChunk>;
            };
        };
    };
    completions: T["completions"] & {
        create: {
            (arg: OpenAI.CompletionCreateParamsStreaming, arg2?: OpenAI.RequestOptions & {
                langsmithExtra?: ExtraRunTreeConfig;
            }): APIPromise<AsyncGenerator<OpenAI.Completion>>;
        } & {
            (arg: OpenAI.CompletionCreateParamsNonStreaming, arg2?: OpenAI.RequestOptions & {
                langsmithExtra?: ExtraRunTreeConfig;
            }): APIPromise<OpenAI.Completion>;
        };
    };
};
/**
 * Wraps an OpenAI client's completion methods, enabling automatic LangSmith
 * tracing. Method signatures are unchanged, with the exception that you can pass
 * an additional and optional "langsmithExtra" field within the second parameter.
 * @param openai An OpenAI client instance.
 * @param options LangSmith options.
 * @example
 * ```ts
 * import { OpenAI } from "openai";
 * import { wrapOpenAI } from "langsmith/wrappers/openai";
 *
 * const patchedClient = wrapOpenAI(new OpenAI());
 *
 * const patchedStream = await patchedClient.chat.completions.create(
 *   {
 *     messages: [{ role: "user", content: `Say 'foo'` }],
 *     model: "gpt-3.5-turbo",
 *     stream: true,
 *   },
 *   {
 *     langsmithExtra: {
 *       metadata: {
 *         additional_data: "bar",
 *       },
 *     },
 *   },
 * );
 * ```
 */
export declare const wrapOpenAI: <T extends OpenAIType>(openai: T, options?: Partial<RunTreeConfig>) => PatchedOpenAIClient<T>;
export {};
