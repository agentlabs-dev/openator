import { RunFromFile } from '@/app/usecases/run-from-file';

const main = async () => {
  const runFromFile = new RunFromFile();

  await runFromFile.execute('../examples/taia-voyager.json');

  console.log('done');
};

main();
