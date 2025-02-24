import { Variable } from './variable';
export declare class VariableString {
    private readonly _value;
    private readonly variables;
    constructor(_value: string, variables: Variable[]);
    publicValue(): string;
    dangerousValue(): string;
}
