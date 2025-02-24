import { Serializable } from "@langchain/core/load/serializable";
import { generateTableInfoFromTables, getTableAndColumnsName, verifyIgnoreTablesExistInDatabase, verifyIncludeTablesExistInDatabase, verifyListTablesExistInDatabase, } from "./util/sql_utils.js";
/**
 * Class that represents a SQL database in the LangChain framework.
 *
 * @security **Security Notice**
 * This class generates SQL queries for the given database.
 * The SQLDatabase class provides a getTableInfo method that can be used
 * to get column information as well as sample data from the table.
 * To mitigate risk of leaking sensitive data, limit permissions
 * to read and scope to the tables that are needed.
 * Optionally, use the includesTables or ignoreTables class parameters
 * to limit which tables can/cannot be accessed.
 *
 * @link See https://js.langchain.com/docs/security for more information.
 */
export class SqlDatabase extends Serializable {
    toJSON() {
        return this.toJSONNotImplemented();
    }
    constructor(fields) {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "sql_db"]
        });
        Object.defineProperty(this, "appDataSourceOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "appDataSource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "allTables", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "includesTables", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "ignoreTables", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "sampleRowsInTableInfo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3
        });
        Object.defineProperty(this, "customDescription", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.appDataSource = fields.appDataSource;
        this.appDataSourceOptions = fields.appDataSource.options;
        if (fields?.includesTables && fields?.ignoreTables) {
            throw new Error("Cannot specify both include_tables and ignoreTables");
        }
        this.includesTables = fields?.includesTables ?? [];
        this.ignoreTables = fields?.ignoreTables ?? [];
        this.sampleRowsInTableInfo =
            fields?.sampleRowsInTableInfo ?? this.sampleRowsInTableInfo;
    }
    static async fromDataSourceParams(fields) {
        const sqlDatabase = new SqlDatabase(fields);
        if (!sqlDatabase.appDataSource.isInitialized) {
            await sqlDatabase.appDataSource.initialize();
        }
        sqlDatabase.allTables = await getTableAndColumnsName(sqlDatabase.appDataSource);
        sqlDatabase.customDescription = Object.fromEntries(Object.entries(fields?.customDescription ?? {}).filter(([key, _]) => sqlDatabase.allTables
            .map((table) => table.tableName)
            .includes(key)));
        verifyIncludeTablesExistInDatabase(sqlDatabase.allTables, sqlDatabase.includesTables);
        verifyIgnoreTablesExistInDatabase(sqlDatabase.allTables, sqlDatabase.ignoreTables);
        return sqlDatabase;
    }
    static async fromOptionsParams(fields) {
        const { DataSource } = await import("typeorm");
        const dataSource = new DataSource(fields.appDataSourceOptions);
        return SqlDatabase.fromDataSourceParams({
            ...fields,
            appDataSource: dataSource,
        });
    }
    /**
     * Get information about specified tables.
     *
     * Follows best practices as specified in: Rajkumar et al, 2022
     * (https://arxiv.org/abs/2204.00498)
     *
     * If `sample_rows_in_table_info`, the specified number of sample rows will be
     * appended to each table description. This can increase performance as
     * demonstrated in the paper.
     */
    async getTableInfo(targetTables) {
        let selectedTables = this.includesTables.length > 0
            ? this.allTables.filter((currentTable) => this.includesTables.includes(currentTable.tableName))
            : this.allTables;
        if (this.ignoreTables.length > 0) {
            selectedTables = selectedTables.filter((currentTable) => !this.ignoreTables.includes(currentTable.tableName));
        }
        if (targetTables && targetTables.length > 0) {
            verifyListTablesExistInDatabase(this.allTables, targetTables, "Wrong target table name:");
            selectedTables = this.allTables.filter((currentTable) => targetTables.includes(currentTable.tableName));
        }
        return generateTableInfoFromTables(selectedTables, this.appDataSource, this.sampleRowsInTableInfo, this.customDescription);
    }
    /**
     * Execute a SQL command and return a string representing the results.
     * If the statement returns rows, a string of the results is returned.
     * If the statement returns no rows, an empty string is returned.
     */
    async run(command, fetch = "all") {
        // TODO: Potential security issue here
        const res = await this.appDataSource.query(command);
        if (fetch === "all") {
            return JSON.stringify(res);
        }
        if (res?.length > 0) {
            return JSON.stringify(res[0]);
        }
        return "";
    }
    serialize() {
        return {
            _type: "sql_database",
            appDataSourceOptions: this.appDataSourceOptions,
            includesTables: this.includesTables,
            ignoreTables: this.ignoreTables,
            sampleRowsInTableInfo: this.sampleRowsInTableInfo,
        };
    }
    /** @ignore */
    static async imports() {
        try {
            const { DataSource } = await import("typeorm");
            return { DataSource };
        }
        catch (e) {
            console.error(e);
            throw new Error("Failed to load typeorm. Please install it with eg. `yarn add typeorm`.");
        }
    }
}
