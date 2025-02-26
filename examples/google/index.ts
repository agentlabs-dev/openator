import { ChatGoogleGenAI, initOpenator } from 'openator';

import 'dotenv/config';

const main = async () => {
  const llm = new ChatGoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
    model: 'gemini-1.5-flash',
  });

  const openator = initOpenator({
    llm,
    headless: false,
  });

  const result = await openator.start(
    'https://amazon.com',
    'Find a black wirelesskeyboard and return the price.',
  );
};

main();
