import { AgentReporter } from '@/core/interfaces/agent-reporter.interface';

export class ConsoleReporter implements AgentReporter {
  constructor(private readonly name: string) {}

  getSpinner() {}

  success(message: string): void {
    console.log(`[${this.name}] ✅ ${message}`);
  }

  failure(message: string): void {
    console.log(`[${this.name}] ❌ ${message}`);
  }

  loading(message: string): void {
    console.log(`[${this.name}] 💡 ${message}`);
  }

  info(message: string): void {
    console.log(`[${this.name}] 💡 ${message}`);
  }
}
