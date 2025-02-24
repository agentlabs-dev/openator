// Default generic "any" values are for backwards compatibility.
// Replace with "string" when we are comfortable with a breaking change.
import { Runnable } from "../runnables/base.js";
/**
 * Base class for prompt templates. Exposes a format method that returns a
 * string prompt given a set of input values.
 */
export class BasePromptTemplate extends Runnable {
    get lc_attributes() {
        return {
            partialVariables: undefined, // python doesn't support this yet
        };
    }
    constructor(input) {
        super(input);
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "prompts", this._getPromptType()]
        });
        Object.defineProperty(this, "inputVariables", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "partialVariables", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Metadata to be used for tracing.
         */
        Object.defineProperty(this, "metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Tags to be used for tracing. */
        Object.defineProperty(this, "tags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const { inputVariables } = input;
        if (inputVariables.includes("stop")) {
            throw new Error("Cannot have an input variable named 'stop', as it is used internally, please rename.");
        }
        Object.assign(this, input);
    }
    /**
     * Merges partial variables and user variables.
     * @param userVariables The user variables to merge with the partial variables.
     * @returns A Promise that resolves to an object containing the merged variables.
     */
    async mergePartialAndUserVariables(userVariables) {
        const partialVariables = this.partialVariables ?? {};
        const partialValues = {};
        for (const [key, value] of Object.entries(partialVariables)) {
            if (typeof value === "string") {
                partialValues[key] = value;
            }
            else {
                partialValues[key] = await value();
            }
        }
        const allKwargs = {
            ...partialValues,
            ...userVariables,
        };
        return allKwargs;
    }
    /**
     * Invokes the prompt template with the given input and options.
     * @param input The input to invoke the prompt template with.
     * @param options Optional configuration for the callback.
     * @returns A Promise that resolves to the output of the prompt template.
     */
    async invoke(input, options) {
        const metadata = {
            ...this.metadata,
            ...options?.metadata,
        };
        const tags = [...(this.tags ?? []), ...(options?.tags ?? [])];
        return this._callWithConfig((input) => this.formatPromptValue(input), input, { ...options, tags, metadata, runType: "prompt" });
    }
    /**
     * Return a json-like object representing this prompt template.
     * @deprecated
     */
    serialize() {
        throw new Error("Use .toJSON() instead");
    }
    /**
     * @deprecated
     * Load a prompt template from a json-like object describing it.
     *
     * @remarks
     * Deserializing needs to be async because templates (e.g. {@link FewShotPromptTemplate}) can
     * reference remote resources that we read asynchronously with a web
     * request.
     */
    static async deserialize(data) {
        switch (data._type) {
            case "prompt": {
                const { PromptTemplate } = await import("./prompt.js");
                return PromptTemplate.deserialize(data);
            }
            case undefined: {
                const { PromptTemplate } = await import("./prompt.js");
                return PromptTemplate.deserialize({ ...data, _type: "prompt" });
            }
            case "few_shot": {
                const { FewShotPromptTemplate } = await import("./few_shot.js");
                return FewShotPromptTemplate.deserialize(data);
            }
            default:
                throw new Error(`Invalid prompt type in config: ${data._type}`);
        }
    }
}
