import { homedir } from "os";
import { printText } from "./utils/texts.js";
import { lang } from "./settings/lang.js";
import { Operations } from "./classes/Operations.js";

const operations = new Operations();

const onInputData = async (chunk) => {
  const command = chunk.toString().trim();

  await operations.processCommand(command);
};

const args = process.argv.slice(2);

const argsArray = [];

args.forEach((arg) => {
  const argParts = arg.split("=");
  if (argParts[0].startsWith("--")) {
    argsArray.push([argParts[0].substring(2, arg.length), argParts[1]]);
  }
});

const userArg = argsArray.find((item) => item[0] === "username");

if (!userArg) {
  // TODO Check when this text appear.
  printText(lang.invalidInput, "red");
} else {
  const username = userArg[1];

  // TODO Try to not use child process
  printText(`Welcome to the File Manager, ${username}!\n`, "yellow");

  printText(`You are currently in ${homedir}`, "white");

  process.stdin.on("data", await onInputData);
}
