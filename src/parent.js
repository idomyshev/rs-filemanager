import {fork} from "child_process";
import {homedir} from "os";
import {getCurrentDirPath} from "./utils/files.js";

const spawnChildProcess = async (args) => {
  const dirPath = getCurrentDirPath(import.meta.url);

  const childFile = `${dirPath}/child.js`;

  fork(childFile, args);
};

const args = process.argv.slice(2);

const argsArray = [];

args.forEach((arg) => {
  const argParts = arg.split("=");
  if (argParts[0].startsWith("--")) {
    argsArray.push([argParts[0].substring(2, arg.length), argParts[1]]);
  }
});

const arg = argsArray.find((item) => item[0] === "username");

if (!arg) {
  console.log("Error: user not specified");
} else {
  const username = arg[1];

  // TODO Try to not use child process
  console.log(`Welcome to the File Manager, ${username}!\n`);

  console.log(`You are currently in ${homedir}`);

  spawnChildProcess([username]);
}
