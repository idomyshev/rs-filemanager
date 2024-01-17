import {homedir} from "os";
import {lang} from "../settings/lang.js";
import {cp} from "fs/promises";
import {commandConfig} from "../settings/commandConfig.js";

export class FileManager {
  dir;
  username;

  constructor() {
    this.dir = homedir;
  }

  async cp(file1, file2) {
    const sourceDirPath = `${this.dir}/${file1}`;
    const targetDirPath = `${this.dir}/${file2}`;

    try {
      await cp(sourceDirPath, targetDirPath, {
        recursive: true,
        force: false,
        errorOnExist: true,
      });
    } catch (err) {
      throw new Error;
    }
  }

  async processCommand(inputString) {
    const args = inputString.split(" ").filter((item) => item.trim())

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
          this.operationFailed();
        }
    }

    this.printDir();
  }

  printDir() {
    console.log(`\n\x1b[97mYou are currently in ${this.dir}\x1b[0m\n`);
  }

  printGoodbye() {
    console.log(`Thank you for using File Manager, ${this.username}, goodbye!\n`);
  };

  invalidInput() {
    console.log(`\n\x1b[91m${lang.invalidInput} \x1b[0m`);
    this.printDir();
  }

  operationFailed() {
    console.log(`\n\x1b[91m${lang.operationFailed} \x1b[0m`);
  }
}
