import {FileManager} from "./classes/FileManager.js";

const args = process.argv.slice(2);

const username = args[0];

const fileManager = new FileManager();

const onInputData = async (chunk) => {
  const command = chunk.toString().trim();

  await fileManager.processCommand(command);
};

process.stdin.on("data", await onInputData);

process.on("SIGINT", function () {
  fileManager.printGoodbye(username);
});
