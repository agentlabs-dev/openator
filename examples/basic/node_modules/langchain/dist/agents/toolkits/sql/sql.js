import { BaseToolkit } from "@langchain/core/tools";
import { renderTemplate } from "@langchain/core/prompts";
import { InfoSqlTool, ListTablesSqlTool, QueryCheckerTool, QuerySqlTool, } from "../../../tools/sql.js";
import { SQL_PREFIX, SQL_SUFFIX } from "./prompt.js";
import { LLMChain } from "../../../chains/llm_chain.js";
import { ZeroShotAgent } from "../../mrkl/index.js";
import { AgentExecutor } from "../../executor.js";
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
export class SqlToolkit extends BaseToolkit {
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
            new QuerySqlTool(db),
            new InfoSqlTool(db),
            new ListTablesSqlTool(db),
            new QueryCheckerTool({ llm }),
        ];
    }
}
export function createSqlAgent(llm, toolkit, args) {
    const { prefix = SQL_PREFIX, suffix = SQL_SUFFIX, inputVariables = ["input", "agent_scratchpad"], topK = 10, } = args ?? {};
    const { tools } = toolkit;
    const formattedPrefix = renderTemplate(prefix, "f-string", {
        dialect: toolkit.dialect,
        top_k: topK,
    });
    const prompt = ZeroShotAgent.createPrompt(tools, {
        prefix: formattedPrefix,
        suffix,
        inputVariables,
    });
    const chain = new LLMChain({ prompt, llm });
    const agent = new ZeroShotAgent({
        llmChain: chain,
        allowedTools: tools.map((t) => t.name),
    });
    return AgentExecutor.fromAgentAndTools({
        agent,
        tools,
        returnIntermediateSteps: true,
    });
}
