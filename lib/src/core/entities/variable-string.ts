import { Variable } from "./variable";

export type VariableParams = {
  name: string;
  value: string;
  isSecret: boolean;
};
export class VariableString {
  constructor(
    private readonly _value: string,
    private readonly variables: Variable[],
  ) {}

  publicValue(): string {
    let interpolatedValue = this._value;

    const variablePattern = /{{(.*?)}}/g;
    interpolatedValue = interpolatedValue.replace(
      variablePattern,
      (_, varName) => {
        const variable = this.variables.find((v) => v.name === varName);
        return variable ? variable.publicValue() : `{{${varName}}}`;
      },
    );

    return interpolatedValue;
  }

  dangerousValue(): string {
    let interpolatedValue = this._value;

    const variablePattern = /{{(.*?)}}/g;
    interpolatedValue = interpolatedValue.replace(
      variablePattern,
      (_, varName) => {
        const variable = this.variables.find((v) => v.name === varName);
        return variable ? variable.dangerousValue() : `{{${varName}}}`;
      },
    );

    return interpolatedValue;
  }
}
