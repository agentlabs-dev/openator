import { AgentReporter } from '@/core/interfaces/agent-reporter.interface';
export declare class OraReporter implements AgentReporter {
    private readonly name;
    private spinner;
    constructor(name: string);
    getSpinner(): any;
    success(message: string): void;
    failure(message: string): void;
    loading(message: string): void;
    info(message: string): void;
}
//# sourceMappingURL=ora-reporter.d.ts.map