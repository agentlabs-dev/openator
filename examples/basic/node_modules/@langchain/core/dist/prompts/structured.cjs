"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredPrompt = void 0;
const chat_js_1 = require("./chat.cjs");
function isWithStructuredOutput(x
// eslint-disable-next-line @typescript-eslint/ban-types
) {
    return (typeof x === "object" &&
        x != null &&
        "withStructuredOutput" in x &&
        typeof x.withStructuredOutput === "function");
}
function isRunnableBinding(x) {
    return (typeof x === "object" &&
        x != null &&
        "lc_id" in x &&
        Array.isArray(x.lc_id) &&
        x.lc_id.join("/") === "langchain_core/runnables/RunnableBinding");
}
class StructuredPrompt extends chat_js_1.ChatPromptTemplate {
    get lc_aliases() {
        return {
            ...super.lc_aliases,
            schema: "schema_",
        };
    }
    constructor(input) {
        super(input);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.defineProperty(this, "schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "prompts", "structured"]
        });
        this.schema = input.schema;
    }
    pipe(coerceable) {
        if (isWithStructuredOutput(coerceable)) {
            return super.pipe(coerceable.withStructuredOutput(this.schema));
        }
        if (isRunnableBinding(coerceable) &&
            isWithStructuredOutput(coerceable.bound)) {
            return super.pipe(coerceable.bound
                .withStructuredOutput(this.schema)
                .bind(coerceable.kwargs ?? {})
                .withConfig(coerceable.config));
        }
        throw new Error(`Structured prompts need to be piped to a language model that supports the "withStructuredOutput()" method.`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromMessagesAndSchema(promptMessages, schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) {
        return StructuredPrompt.fromMessages(promptMessages, { schema });
    }
}
exports.StructuredPrompt = StructuredPrompt;
