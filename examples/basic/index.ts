import { initOpenator, Variable, LLM } from '../../dist';

import 'dotenv/config';

const main = async () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const openator = initOpenator({
    headless: false,
    openAiApiKey: process.env.OPENAI_API_KEY,
    variables: [
      new Variable({
        name: 'password',
        value: process.env.PASSWORD!,
        isSecret: true,
      }),
    ],
  });

  const result = await openator.start(
    'https://amazon.com',
    'Find a black wirelesskeyboard and return the price.',
  );
};

main();
