import { FileManager } from "./classes/FileManager.js";

const args = process.argv.slice(2);

const username = args[0];

const fileManager = new FileManager();

const onInputData = (chunk) => {
  const command = chunk.toString().trim();

  fileManager.processCommand(command);
};

process.stdin.on("data", onInputData);

process.on("SIGINT", function () {
  fileManager.printGoodbye(username);
});
