export const TestResultStatuses = ["passed", "failed"] as const;

export type TestResultStatus = (typeof TestResultStatuses)[number];

export type TestResult = {
  status: TestResultStatus;
  reason: string;
};
