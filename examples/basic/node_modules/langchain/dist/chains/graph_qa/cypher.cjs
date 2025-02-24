"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphCypherQAChain = exports.INTERMEDIATE_STEPS_KEY = void 0;
const llm_chain_js_1 = require("../llm_chain.cjs");
const base_js_1 = require("../base.cjs");
const prompts_js_1 = require("./prompts.cjs");
const entrypoint_deprecation_js_1 = require("../../util/entrypoint_deprecation.cjs");
/* #__PURE__ */ (0, entrypoint_deprecation_js_1.logVersion020MigrationWarning)({
    oldEntrypointName: "chains/graph_qa/cypher",
    newPackageName: "@langchain/community",
});
exports.INTERMEDIATE_STEPS_KEY = "intermediateSteps";
/**
 * Chain for question-answering against a graph by generating Cypher statements.
 *
 * @example
 * ```typescript
 * const chain = new GraphCypherQAChain({
 *   llm: new ChatOpenAI({ temperature: 0 }),
 *   graph: new Neo4jGraph(),
 * });
 * const res = await chain.invoke("Who played in Pulp Fiction?");
 * ```
 *
 * @security
 * This chain will execute Cypher statements against the provided database.
 * Make sure that the database connection uses credentials
 * that are narrowly-scoped to only include necessary permissions.
 * Failure to do so may result in data corruption or loss, since the calling code
 * may attempt commands that would result in deletion, mutation of data
 * if appropriately prompted or reading sensitive data if such data is present in the database.
 * The best way to guard against such negative outcomes is to (as appropriate) limit the
 * permissions granted to the credentials used with this tool.
 *
 * See https://js.langchain.com/docs/security for more information.
 */
class GraphCypherQAChain extends base_js_1.BaseChain {
    constructor(props) {
        super(props);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.defineProperty(this, "graph", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cypherGenerationChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "qaChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "query"
        });
        Object.defineProperty(this, "outputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "result"
        });
        Object.defineProperty(this, "topK", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 10
        });
        Object.defineProperty(this, "returnDirect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "returnIntermediateSteps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        const { graph, cypherGenerationChain, qaChain, inputKey, outputKey, topK, returnIntermediateSteps, returnDirect, } = props;
        this.graph = graph;
        this.cypherGenerationChain = cypherGenerationChain;
        this.qaChain = qaChain;
        if (inputKey) {
            this.inputKey = inputKey;
        }
        if (outputKey) {
            this.outputKey = outputKey;
        }
        if (topK) {
            this.topK = topK;
        }
        if (returnIntermediateSteps) {
            this.returnIntermediateSteps = returnIntermediateSteps;
        }
        if (returnDirect) {
            this.returnDirect = returnDirect;
        }
    }
    _chainType() {
        return "graph_cypher_chain";
    }
    get inputKeys() {
        return [this.inputKey];
    }
    get outputKeys() {
        return [this.outputKey];
    }
    static fromLLM(props) {
        const { graph, qaPrompt = prompts_js_1.CYPHER_QA_PROMPT, cypherPrompt = prompts_js_1.CYPHER_GENERATION_PROMPT, llm, cypherLLM, qaLLM, returnIntermediateSteps = false, returnDirect = false, } = props;
        if (!cypherLLM && !llm) {
            throw new Error("Either 'llm' or 'cypherLLM' parameters must be provided");
        }
        if (!qaLLM && !llm) {
            throw new Error("Either 'llm' or 'qaLLM' parameters must be provided");
        }
        if (cypherLLM && qaLLM && llm) {
            throw new Error("You can specify up to two of 'cypherLLM', 'qaLLM', and 'llm', but not all three simultaneously.");
        }
        const qaChain = new llm_chain_js_1.LLMChain({
            llm: (qaLLM || llm),
            prompt: qaPrompt,
        });
        const cypherGenerationChain = new llm_chain_js_1.LLMChain({
            llm: (cypherLLM || llm),
            prompt: cypherPrompt,
        });
        return new GraphCypherQAChain({
            cypherGenerationChain,
            qaChain,
            graph,
            returnIntermediateSteps,
            returnDirect,
        });
    }
    extractCypher(text) {
        const pattern = /```(.*?)```/s;
        const matches = text.match(pattern);
        return matches ? matches[1] : text;
    }
    async _call(values, runManager) {
        const callbacks = runManager?.getChild();
        const question = values[this.inputKey];
        const intermediateSteps = [];
        const generatedCypher = await this.cypherGenerationChain.call({ question, schema: this.graph.getSchema() }, callbacks);
        const extractedCypher = this.extractCypher(generatedCypher.text);
        await runManager?.handleText(`Generated Cypher:\n`);
        await runManager?.handleText(`${extractedCypher} green\n`);
        intermediateSteps.push({ query: extractedCypher });
        let chainResult;
        const context = await this.graph.query(extractedCypher, {
            topK: this.topK,
        });
        if (this.returnDirect) {
            chainResult = { [this.outputKey]: context };
        }
        else {
            await runManager?.handleText("Full Context:\n");
            await runManager?.handleText(`${context} green\n`);
            intermediateSteps.push({ context });
            const result = await this.qaChain.call({ question, context: JSON.stringify(context) }, callbacks);
            chainResult = {
                [this.outputKey]: result[this.qaChain.outputKey],
            };
        }
        if (this.returnIntermediateSteps) {
            chainResult[exports.INTERMEDIATE_STEPS_KEY] = intermediateSteps;
        }
        return chainResult;
    }
}
exports.GraphCypherQAChain = GraphCypherQAChain;
