import * as ora from 'ora-classic';
import { AgentReporter } from '@/core/interfaces/agent-reporter.interface';

export class OraReporter implements AgentReporter {
  private spinner: ora.Ora | undefined;

  constructor(private readonly name: string) {}

  getSpinner() {
    if (!this.spinner) {
      this.spinner = ora({ prefixText: `[${this.name}]` }).start();
    }
    return this.spinner;
  }

  success(message: string): void {
    this.getSpinner().stopAndPersist({
      symbol: '✅',
      text: message,
    });
  }

  failure(message: string): void {
    this.getSpinner().stopAndPersist({
      symbol: '❌',
      text: message,
    });
  }

  loading(message: string): void {
    this.getSpinner().text = message;
    this.getSpinner().start();
  }

  info(message: string): void {
    this.spinner?.stopAndPersist({
      symbol: '💡',
      text: message,
    });
  }
}
