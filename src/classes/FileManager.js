import {homedir, EOL} from "os";
import {lang} from "../settings/lang.js";
import {commandConfig} from "../settings/commandConfig.js";
import {printText} from "../utils/texts.js";
import {SEPARATOR} from "../settings/filesystem.js";
import {isAbsolute} from "path";

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
        this.printGoodbye();
        process.exit(0);
        break;
      default:
        try {
          await this[commandName](...args);
        } catch (err) {
          // TODO Delete console.log before send the task to review.
          console.log(err);
          this.operationFailed();
        } finally {
          this.printDir();
        }
    }
  }

  printDir() {
    printText(`You are currently in ${this.dir}`, "white");
  }

  printGoodbye() {
    printText(`${EOL}Thank you for using File Manager, ${this.username}, goodbye!${EOL}`, "yellow");
  }

  invalidInput() {
    printText(lang.invalidInput, "red");
    this.printDir();
  }

  operationFailed() {
    printText(lang.operationFailed, "red");
  }

  transformPath(filePath) {
    return isAbsolute(filePath) ? filePath : `${this.dir}${SEPARATOR}${filePath}`
  };
}
