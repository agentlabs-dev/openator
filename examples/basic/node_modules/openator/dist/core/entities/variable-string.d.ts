import { Variable } from "./variable";
export type VariableParams = {
    name: string;
    value: string;
    isSecret: boolean;
};
export declare class VariableString {
    private readonly _value;
    private readonly variables;
    constructor(_value: string, variables: Variable[]);
    publicValue(): string;
    dangerousValue(): string;
}
