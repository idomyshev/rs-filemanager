import {Operations} from "./classes/Operations.js";

const args = process.argv.slice(2);

const username = args[0];

const operations = new Operations();

const onInputData = async (chunk) => {
  const command = chunk.toString().trim();

  await operations.processCommand(command);
};

process.stdin.on("data", await onInputData);

process.on("SIGINT", function () {
  fileManager.printGoodbye(username);
});
