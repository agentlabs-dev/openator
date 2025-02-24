"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryCheckerTool = exports.ListTablesSqlTool = exports.InfoSqlTool = exports.QuerySqlTool = void 0;
const openai_1 = require("@langchain/openai");
const tools_1 = require("@langchain/core/tools");
const prompts_1 = require("@langchain/core/prompts");
const llm_chain_js_1 = require("../chains/llm_chain.cjs");
/**
 * A tool for executing SQL queries. It takes a SQL database as a
 * parameter and assigns it to the `db` property. The `_call` method is
 * used to run the SQL query and return the result. If the query is
 * incorrect, an error message is returned.
 */
class QuerySqlTool extends tools_1.Tool {
    static lc_name() {
        return "QuerySqlTool";
    }
    constructor(db) {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "query-sql"
        });
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `Input to this tool is a detailed and correct SQL query, output is a result from the database.
  If the query is not correct, an error message will be returned.
  If an error is returned, rewrite the query, check the query, and try again.`
        });
        this.db = db;
    }
    /** @ignore */
    async _call(input) {
        try {
            return await this.db.run(input);
        }
        catch (error) {
            return `${error}`;
        }
    }
}
exports.QuerySqlTool = QuerySqlTool;
/**
 * A tool for retrieving information about SQL tables. It takes a SQL
 * database as a parameter and assigns it to the `db` property. The
 * `_call` method is used to retrieve the schema and sample rows for the
 * specified tables. If the tables do not exist, an error message is
 * returned.
 */
class InfoSqlTool extends tools_1.Tool {
    static lc_name() {
        return "InfoSqlTool";
    }
    constructor(db) {
        super();
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "info-sql"
        });
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `Input to this tool is a comma-separated list of tables, output is the schema and sample rows for those tables.
    Be sure that the tables actually exist by calling list-tables-sql first!

    Example Input: "table1, table2, table3.`
        });
        this.db = db;
    }
    /** @ignore */
    async _call(input) {
        try {
            const tables = input.split(",").map((table) => table.trim());
            return await this.db.getTableInfo(tables);
        }
        catch (error) {
            return `${error}`;
        }
    }
}
exports.InfoSqlTool = InfoSqlTool;
/**
 * A tool for listing all tables in a SQL database. It takes a SQL
 * database as a parameter and assigns it to the `db` property. The
 * `_call` method is used to return a comma-separated list of all tables
 * in the database.
 */
class ListTablesSqlTool extends tools_1.Tool {
    static lc_name() {
        return "ListTablesSqlTool";
    }
    constructor(db) {
        super();
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "list-tables-sql"
        });
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `Input is an empty string, output is a comma-separated list of tables in the database.`
        });
        this.db = db;
    }
    async _call(_) {
        try {
            let selectedTables = this.db.allTables;
            if (this.db.includesTables.length > 0) {
                selectedTables = selectedTables.filter((currentTable) => this.db.includesTables.includes(currentTable.tableName));
            }
            if (this.db.ignoreTables.length > 0) {
                selectedTables = selectedTables.filter((currentTable) => !this.db.ignoreTables.includes(currentTable.tableName));
            }
            const tables = selectedTables.map((table) => table.tableName);
            return tables.join(", ");
        }
        catch (error) {
            return `${error}`;
        }
    }
}
exports.ListTablesSqlTool = ListTablesSqlTool;
/**
 * A tool for checking SQL queries for common mistakes. It takes a
 * LLMChain or QueryCheckerToolArgs as a parameter. The `_call` method is
 * used to check the input query for common mistakes and returns a
 * prediction.
 */
class QueryCheckerTool extends tools_1.Tool {
    static lc_name() {
        return "QueryCheckerTool";
    }
    constructor(llmChainOrOptions) {
        super();
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "query-checker"
        });
        Object.defineProperty(this, "template", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `
    {query}
Double check the SQL query above for common mistakes, including:
- Using NOT IN with NULL values
- Using UNION when UNION ALL should have been used
- Using BETWEEN for exclusive ranges
- Data type mismatch in predicates
- Properly quoting identifiers
- Using the correct number of arguments for functions
- Casting to the correct data type
- Using the proper columns for joins

If there are any of the above mistakes, rewrite the query. If there are no mistakes, just reproduce the original query.`
        });
        Object.defineProperty(this, "llmChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `Use this tool to double check if your query is correct before executing it.
    Always use this tool before executing a query with query-sql!`
        });
        if (typeof llmChainOrOptions?._chainType === "function") {
            this.llmChain = llmChainOrOptions;
        }
        else {
            const options = llmChainOrOptions;
            if (options?.llmChain !== undefined) {
                this.llmChain = options.llmChain;
            }
            else {
                const prompt = new prompts_1.PromptTemplate({
                    template: this.template,
                    inputVariables: ["query"],
                });
                const llm = options?.llm ?? new openai_1.OpenAI({ temperature: 0 });
                this.llmChain = new llm_chain_js_1.LLMChain({ llm, prompt });
            }
        }
    }
    /** @ignore */
    async _call(input) {
        return this.llmChain.predict({ query: input });
    }
}
exports.QueryCheckerTool = QueryCheckerTool;
