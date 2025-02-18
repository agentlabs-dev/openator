import type { Conversation } from '$lib/entities/conversation';
import { setConversations } from '$lib/stores/conversations';

export const listConversations = () => {
	const conversations: Conversation[] = [
		{
			id: '1',
			messages: [
				{
					id: '1',
					role: 'user',
					content: 'Write a blog post about the future of AI',
					createdAt: new Date(),
					type: 'text'
				},
				{
					id: '2',
					role: 'assistant',
					content: "Let's accomplish this task, you can consider it done. 🎉",
					createdAt: new Date(),
					type: 'text'
				},
				{
					id: '3',
					type: 'job',
					jobId: '1',
					role: 'assistant',
					content: {
						id: '1',
						tasks: [
							{
								id: '1',
								description: 'Write a blog post about the future of AI',
								status: 'completed',
								actions: []
							},
							{
								id: '2',
								description: 'Write a blog post about the future of AI',
								status: 'completed',
								actions: []
							}
						],
						status: 'running',
						message: 'The blog post has been written',
						brainState: 'thinking',
						resultReason: 'The blog post has been written'
					},
					createdAt: new Date()
				}
			]
		}
	];

	setConversations(conversations);
};
