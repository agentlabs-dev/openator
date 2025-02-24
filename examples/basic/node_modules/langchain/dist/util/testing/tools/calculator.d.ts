import { Tool } from "@langchain/core/tools";
/**
 * The Calculator class is a tool used to evaluate mathematical
 * expressions. It extends the base Tool class.
 * @example
 * ```typescript
 * const calculator = new Calculator();
 * const sum = calculator.add(99, 99);
 * console.log("The sum of 99 and 99 is:", sum);
 * ```
 */
export declare class Calculator extends Tool {
    static lc_name(): string;
    get lc_namespace(): string[];
    name: string;
    /** @ignore */
    _call(_input: string): Promise<"42" | "I don't know how to do that.">;
    description: string;
}
