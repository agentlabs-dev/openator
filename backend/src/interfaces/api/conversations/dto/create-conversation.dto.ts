export class ConversationMessageDto {
  role: 'user' | 'assistant';
  content: string;
}

export class CreateConversationDto {
  taskScenario: string;
}

export class CreateConversationResponseDto {
  id: string;
  jobId: string;
  messages: ConversationMessageDto[];
  task: string;
}
