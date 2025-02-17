export type StartJobResponse = {
	sessionUrl: string;
	password: string;
	jobId: string;
	sessionId: string;
	liveUrl: string;
};

export const startJob = async (startUrl: string, scenario: string): Promise<StartJobResponse> => {
	const response = await fetch('http://localhost:3000/jobs/start', {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify({ scenario, startUrl })
	});

	return response.json();
};
