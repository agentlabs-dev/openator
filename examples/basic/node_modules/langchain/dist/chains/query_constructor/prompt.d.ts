import { PromptTemplate } from "@langchain/core/prompts";
export declare const SONG_DATA_SOURCE: string;
export declare const FULL_ANSWER = "```json\n{{\n    \"query\": \"teenager love\",\n    \"filter\": \"and(or(eq(\\\"artist\\\", \\\"Taylor Swift\\\"), eq(\\\"artist\\\", \\\"Katy Perry\\\")), lt(\\\"length\\\", 180), eq(\\\"genre\\\", \\\"pop\\\"))\"\n}}";
export declare const NO_FILTER_ANSWER = "```json\n{{\n    \"query\": \"\",\n    \"filter\": \"NO_FILTER\"\n}}\n```";
export declare const DEFAULT_EXAMPLES: {
    i: string;
    data_source: string;
    user_query: string;
    structured_request: string;
}[];
export declare const EXAMPLE_PROMPT_TEMPLATE = "<< Example {i}. >>\nData Source:\n{data_source}\n\nUser Query:\n{user_query}\n\nStructured Request:\n{structured_request}\n";
export declare const EXAMPLE_PROMPT: PromptTemplate<{
    i: any;
    data_source: any;
    user_query: any;
    structured_request: any;
}, any>;
export declare const DEFAULT_SCHEMA = "<< Structured Request Schema >>\nWhen responding use a markdown code snippet with a JSON object formatted in the following schema:\n\n```json\n{{{{\n    \"query\": string \\ text string to compare to document contents\n    \"filter\": string \\ logical condition statement for filtering documents\n}}}}\n```\n\nThe query string should contain only text that is expected to match the contents of documents. Any conditions in the filter should not be mentioned in the query as well.\n\nA logical condition statement is composed of one or more comparison and logical operation statements.\n\nA comparison statement takes the form: `comp(attr, val)`:\n- `comp` ({allowed_comparators}): comparator\n- `attr` (string):  name of attribute to apply the comparison to\n- `val` (string): is the comparison value\n\nA logical operation statement takes the form `op(statement1, statement2, ...)`:\n- `op` ({allowed_operators}): logical operator\n- `statement1`, `statement2`, ... (comparison statements or logical operation statements): one or more statements to apply the operation to\n\nMake sure that you only use the comparators and logical operators listed above and no others.\nMake sure that filters only refer to attributes that exist in the data source.\nMake sure that filters only use the attributed names with its function names if there are functions applied on them.\nMake sure that filters only use format `YYYY-MM-DD` when handling timestamp data typed values.\nMake sure that filters take into account the descriptions of attributes and only make comparisons that are feasible given the type of data being stored.\nMake sure that filters are only used as needed. If there are no filters that should be applied return \"NO_FILTER\" for the filter value.";
export declare const DEFAULT_PREFIX = "Your goal is to structure the user's query to match the request schema provided below.\n\n{schema}";
export declare const DEFAULT_SUFFIX = "<< Example {i}. >>\nData Source:\n```json\n{{{{\n    \"content\": \"{content}\",\n    \"attributes\": {attributes}\n}}}}\n```\n\nUser Query:\n{{query}}\n\nStructured Request:\n";
