import { homedir } from "os";
import { lang } from "../settings/lang.js";
import { commandConfig } from "../settings/commandConfig.js";
import { printText } from "../utils/texts.js";

export class FileManager {
  dir;
  homeDir;
  username;

  constructor() {
    const path = homedir();
    this.homeDir = path;
    this.dir = path;
  }

  async processCommand(inputString) {
    const args = inputString.split(" ").filter((item) => item.trim());

    const commandName = args[0];

    if (!commandName) {
      this.printDir();
      return;
    }

    args.shift();

    const config = commandConfig[commandName];

    if (!config || config.argsNumber !== args.length) {
      this.invalidInput();
      return;
    }

    switch (commandName) {
      case ".exit":
        process.exit(0);
        break;
      default:
        try {
          await this[commandName](...args);
        } catch (err) {
          // TODO Delete console.log.
          console.log(err);
          this.operationFailed();
        }
    }

    this.printDir();
  }

  printDir() {
    printText(`You are currently in ${this.dir}`, "white");
  }

  printGoodbye() {
    console.log(
      `Thank you for using File Manager, ${this.username}, goodbye!\n`
    );
  }

  invalidInput() {
    printText(lang.invalidInput, "red");
    this.printDir();
  }

  operationFailed() {
    printText(lang.operationFailed, "red");
  }
}
