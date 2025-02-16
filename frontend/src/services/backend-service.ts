export const triggerTestRun = async (
	startUrl: string,
	userStory: string
): Promise<{ sessionUrl: string; password: string; jobId: string }> => {
	const response = await fetch('http://localhost:3000/jobs/start', {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify({ userStory, startUrl })
	});

	return response.json();
};
