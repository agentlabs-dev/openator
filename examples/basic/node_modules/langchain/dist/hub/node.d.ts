import { Runnable } from "@langchain/core/runnables";
import { basePush } from "./base.js";
export { basePush as push };
/**
 * Pull a prompt from the hub.
 * @param ownerRepoCommit The name of the repo containing the prompt, as well as an optional commit hash separated by a slash.
 * @param options.apiKey LangSmith API key to use when pulling the prompt
 * @param options.apiUrl LangSmith API URL to use when pulling the prompt
 * @param options.includeModel Whether to also instantiate and attach a model instance to the prompt,
 *   if the prompt has associated model metadata. If set to true, invoking the resulting pulled prompt will
 *   also invoke the instantiated model. You must have the appropriate LangChain integration package installed.
 * @returns
 */
export declare function pull<T extends Runnable>(ownerRepoCommit: string, options?: {
    apiKey?: string;
    apiUrl?: string;
    includeModel?: boolean;
}): Promise<T>;
