export interface AgentReporter {
  success(message: string): void;
  failure(message: string): void;
  loading(message: string): void;
  info(message: string): void;
}
