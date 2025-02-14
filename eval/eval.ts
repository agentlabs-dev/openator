import { resolve } from "path";
import { readFile } from 'fs-extra';

const main = async () => {
  const answers = JSON.parse(readFileSync(resolve(__dirname, "./answers.json"), "utf-8"));
};

main();