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
          // Uncomment only if needed during developing.
          // console.log(err);
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
    if (filePath) {
      filePath = filePath.trim();
    }

    if (isAbsolute(filePath)) {
      return filePath;
    } else {
      if (this.dir.substring(this.dir.length - 1, this.dir.length) === SEPARATOR) {
        return `${this.dir}${filePath}`;
      } else {
        return `${this.dir}${SEPARATOR}${filePath}`;
      }
    }
  };
}
