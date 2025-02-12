export const triggerTestRun = async (
	startUrl: string,
	userStory: string
): Promise<{ sessionUrl: string; password: string }> => {
	const response = await fetch('http://localhost:3000/jobs/test.run', {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify({ userStory, startUrl })
	});

	return response.json();
};
