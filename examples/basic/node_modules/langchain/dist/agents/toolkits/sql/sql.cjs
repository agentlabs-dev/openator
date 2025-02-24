"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSqlAgent = exports.SqlToolkit = void 0;
const tools_1 = require("@langchain/core/tools");
const prompts_1 = require("@langchain/core/prompts");
const sql_js_1 = require("../../../tools/sql.cjs");
const prompt_js_1 = require("./prompt.cjs");
const llm_chain_js_1 = require("../../../chains/llm_chain.cjs");
const index_js_1 = require("../../mrkl/index.cjs");
const executor_js_1 = require("../../executor.cjs");
/**
 * Class that represents a toolkit for working with SQL databases. It
 * initializes SQL tools based on the provided SQL database.
 * @example
 * ```typescript
 * const model = new ChatOpenAI({});
 * const toolkit = new SqlToolkit(sqlDb, model);
 * const executor = createSqlAgent(model, toolkit);
 * const result = await executor.invoke({ input: 'List the total sales per country. Which country's customers spent the most?' });
 * console.log(`Got output ${result.output}`);
 * ```
 */
class SqlToolkit extends tools_1.BaseToolkit {
    constructor(db, llm) {
        super();
        Object.defineProperty(this, "tools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dialect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "sqlite"
        });
        this.db = db;
        this.tools = [
            new sql_js_1.QuerySqlTool(db),
            new sql_js_1.InfoSqlTool(db),
            new sql_js_1.ListTablesSqlTool(db),
            new sql_js_1.QueryCheckerTool({ llm }),
        ];
    }
}
exports.SqlToolkit = SqlToolkit;
function createSqlAgent(llm, toolkit, args) {
    const { prefix = prompt_js_1.SQL_PREFIX, suffix = prompt_js_1.SQL_SUFFIX, inputVariables = ["input", "agent_scratchpad"], topK = 10, } = args ?? {};
    const { tools } = toolkit;
    const formattedPrefix = (0, prompts_1.renderTemplate)(prefix, "f-string", {
        dialect: toolkit.dialect,
        top_k: topK,
    });
    const prompt = index_js_1.ZeroShotAgent.createPrompt(tools, {
        prefix: formattedPrefix,
        suffix,
        inputVariables,
    });
    const chain = new llm_chain_js_1.LLMChain({ prompt, llm });
    const agent = new index_js_1.ZeroShotAgent({
        llmChain: chain,
        allowedTools: tools.map((t) => t.name),
    });
    return executor_js_1.AgentExecutor.fromAgentAndTools({
        agent,
        tools,
        returnIntermediateSteps: true,
    });
}
exports.createSqlAgent = createSqlAgent;
