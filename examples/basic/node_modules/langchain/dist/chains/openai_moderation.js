import { OpenAIClient } from "@langchain/openai";
import { AsyncCaller, } from "@langchain/core/utils/async_caller";
import { getEnvironmentVariable } from "@langchain/core/utils/env";
import { BaseChain } from "./base.js";
/**
 * Class representing a chain for moderating text using the OpenAI
 * Moderation API. It extends the BaseChain class and implements the
 * OpenAIModerationChainInput interface.
 * @example
 * ```typescript
 * const moderation = new OpenAIModerationChain({ throwError: true });
 *
 * const badString = "Bad naughty words from user";
 *
 * try {
 *   const { output: moderatedContent, results } = await moderation.call({
 *     input: badString,
 *   });
 *
 *   if (results[0].category_scores["harassment/threatening"] > 0.01) {
 *     throw new Error("Harassment detected!");
 *   }
 *
 *   const model = new OpenAI({ temperature: 0 });
 *   const promptTemplate = "Hello, how are you today {person}?";
 *   const prompt = new PromptTemplate({
 *     template: promptTemplate,
 *     inputVariables: ["person"],
 *   });
 *   const chain = new LLMChain({ llm: model, prompt });
 *   const response = await chain.call({ person: moderatedContent });
 *   console.log({ response });
 * } catch (error) {
 *   console.error("Naughty words detected!");
 * }
 * ```
 */
export class OpenAIModerationChain extends BaseChain {
    static lc_name() {
        return "OpenAIModerationChain";
    }
    get lc_secrets() {
        return {
            openAIApiKey: "OPENAI_API_KEY",
        };
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "inputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "input"
        });
        Object.defineProperty(this, "outputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "output"
        });
        Object.defineProperty(this, "openAIApiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "openAIOrganization", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "clientConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "throwError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "caller", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.throwError = fields?.throwError ?? false;
        this.openAIApiKey =
            fields?.apiKey ??
                fields?.openAIApiKey ??
                getEnvironmentVariable("OPENAI_API_KEY");
        if (!this.openAIApiKey) {
            throw new Error("OpenAI API key not found");
        }
        this.openAIOrganization = fields?.openAIOrganization;
        this.clientConfig = {
            ...fields?.configuration,
            apiKey: this.openAIApiKey,
            organization: this.openAIOrganization,
        };
        this.client = new OpenAIClient(this.clientConfig);
        this.caller = new AsyncCaller(fields ?? {});
    }
    _moderate(text, results) {
        if (results.flagged) {
            const errorStr = "Text was found that violates OpenAI's content policy.";
            if (this.throwError) {
                throw new Error(errorStr);
            }
            else {
                return errorStr;
            }
        }
        return text;
    }
    async _call(values) {
        const text = values[this.inputKey];
        const moderationRequest = {
            input: text,
        };
        let mod;
        try {
            mod = await this.caller.call(() => this.client.moderations.create(moderationRequest));
        }
        catch (error) {
            // eslint-disable-next-line no-instanceof/no-instanceof
            if (error instanceof Error) {
                throw error;
            }
            else {
                throw new Error(error);
            }
        }
        const output = this._moderate(text, mod.results[0]);
        return {
            [this.outputKey]: output,
            results: mod.results,
        };
    }
    _chainType() {
        return "moderation_chain";
    }
    get inputKeys() {
        return [this.inputKey];
    }
    get outputKeys() {
        return [this.outputKey];
    }
}
