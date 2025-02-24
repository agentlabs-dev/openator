export type VariableParams = {
    name: string;
    value: string;
    isSecret: boolean;
};
export declare class Variable {
    readonly name: string;
    readonly isSecret: boolean;
    private readonly _value;
    constructor(params: VariableParams);
    publicValue(): string;
    dangerousValue(): string;
}
