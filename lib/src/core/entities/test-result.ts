export const OpenatorResultStatuses = ['success', 'failed'] as const;

export type OpenatorResultStatus = (typeof OpenatorResultStatuses)[number];

export type OpenatorResult = {
  status: OpenatorResultStatus;
  reason: string;
  result: string;
  stepCount: number;
};
