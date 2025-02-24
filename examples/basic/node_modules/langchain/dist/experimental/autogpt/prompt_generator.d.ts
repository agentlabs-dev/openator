import { ObjectTool } from "./schema.js";
/**
 * Class that generates prompts for generative agents. It maintains a list
 * of constraints, commands, resources, and performance evaluations.
 */
export declare class PromptGenerator {
    constraints: string[];
    commands: ObjectTool[];
    resources: string[];
    performance_evaluation: string[];
    response_format: object;
    constructor();
    /**
     * Adds a constraint to the list of constraints.
     * @param constraint The constraint to add.
     * @returns void
     */
    add_constraint(constraint: string): void;
    /**
     * Adds a tool to the list of commands.
     * @param tool The tool to add.
     * @returns void
     */
    add_tool(tool: ObjectTool): void;
    _generate_command_string(tool: ObjectTool): string;
    /**
     * Adds a resource to the list of resources.
     * @param resource The resource to add.
     * @returns void
     */
    add_resource(resource: string): void;
    /**
     * Adds a performance evaluation to the list of performance evaluations.
     * @param evaluation The performance evaluation to add.
     * @returns void
     */
    add_performance_evaluation(evaluation: string): void;
    _generate_numbered_list(items: any[], item_type?: string): string;
    /**
     * Generates a prompt string that includes the constraints, commands,
     * resources, performance evaluations, and response format.
     * @returns A string representing the prompt.
     */
    generate_prompt_string(): string;
}
/**
 * Function that generates a prompt string for a given list of tools.
 */
export declare function getPrompt(tools: ObjectTool[]): string;
