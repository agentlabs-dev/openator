import { concat } from "../utils/stream.js";
import { Runnable, RunnableAssign, RunnableMap, } from "./base.js";
import { ensureConfig } from "./config.js";
/**
 * A runnable to passthrough inputs unchanged or with additional keys.
 *
 * This runnable behaves almost like the identity function, except that it
 * can be configured to add additional keys to the output, if the input is
 * an object.
 *
 * The example below demonstrates how to use `RunnablePassthrough to
 * passthrough the input from the `.invoke()`
 *
 * @example
 * ```typescript
 * const chain = RunnableSequence.from([
 *   {
 *     question: new RunnablePassthrough(),
 *     context: async () => loadContextFromStore(),
 *   },
 *   prompt,
 *   llm,
 *   outputParser,
 * ]);
 * const response = await chain.invoke(
 *   "I can pass a single string instead of an object since I'm using `RunnablePassthrough`."
 * );
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class RunnablePassthrough extends Runnable {
    static lc_name() {
        return "RunnablePassthrough";
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "func", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (fields) {
            this.func = fields.func;
        }
    }
    async invoke(input, options) {
        const config = ensureConfig(options);
        if (this.func) {
            await this.func(input, config);
        }
        return this._callWithConfig((input) => Promise.resolve(input), input, config);
    }
    async *transform(generator, options) {
        const config = ensureConfig(options);
        let finalOutput;
        let finalOutputSupported = true;
        for await (const chunk of this._transformStreamWithConfig(generator, (input) => input, config)) {
            yield chunk;
            if (finalOutputSupported) {
                if (finalOutput === undefined) {
                    finalOutput = chunk;
                }
                else {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        finalOutput = concat(finalOutput, chunk);
                    }
                    catch {
                        finalOutput = undefined;
                        finalOutputSupported = false;
                    }
                }
            }
        }
        if (this.func && finalOutput !== undefined) {
            await this.func(finalOutput, config);
        }
    }
    /**
     * A runnable that assigns key-value pairs to the input.
     *
     * The example below shows how you could use it with an inline function.
     *
     * @example
     * ```typescript
     * const prompt =
     *   PromptTemplate.fromTemplate(`Write a SQL query to answer the question using the following schema: {schema}
     * Question: {question}
     * SQL Query:`);
     *
     * // The `RunnablePassthrough.assign()` is used here to passthrough the input from the `.invoke()`
     * // call (in this example it's the question), along with any inputs passed to the `.assign()` method.
     * // In this case, we're passing the schema.
     * const sqlQueryGeneratorChain = RunnableSequence.from([
     *   RunnablePassthrough.assign({
     *     schema: async () => db.getTableInfo(),
     *   }),
     *   prompt,
     *   new ChatOpenAI({}).bind({ stop: ["\nSQLResult:"] }),
     *   new StringOutputParser(),
     * ]);
     * const result = await sqlQueryGeneratorChain.invoke({
     *   question: "How many employees are there?",
     * });
     * ```
     */
    static assign(mapping) {
        return new RunnableAssign(new RunnableMap({ steps: mapping }));
    }
}
