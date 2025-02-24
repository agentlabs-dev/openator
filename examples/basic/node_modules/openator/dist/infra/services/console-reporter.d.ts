import { AgentReporter } from '@/core/interfaces/agent-reporter.interface';
export declare class ConsoleReporter implements AgentReporter {
    private readonly name;
    constructor(name: string);
    getSpinner(): void;
    success(message: string): void;
    failure(message: string): void;
    loading(message: string): void;
    info(message: string): void;
}
