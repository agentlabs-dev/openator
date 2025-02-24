import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { type ToolInterface, BaseToolkit } from "@langchain/core/tools";
import { ZeroShotCreatePromptArgs } from "../../mrkl/index.js";
import { AgentExecutor } from "../../executor.js";
import { SqlDatabase } from "../../../sql_db.js";
/**
 * Interface that extends ZeroShotCreatePromptArgs and adds an optional
 * topK parameter for specifying the number of results to return.
 */
export interface SqlCreatePromptArgs extends ZeroShotCreatePromptArgs {
    /** Number of results to return. */
    topK?: number;
}
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
export declare class SqlToolkit extends BaseToolkit {
    tools: ToolInterface[];
    db: SqlDatabase;
    dialect: string;
    constructor(db: SqlDatabase, llm?: BaseLanguageModelInterface);
}
export declare function createSqlAgent(llm: BaseLanguageModelInterface, toolkit: SqlToolkit, args?: SqlCreatePromptArgs): AgentExecutor;
