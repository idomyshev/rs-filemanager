import {homedir} from "os";

export class FileManager {
  dir;
  username;

  constructor() {
    this.dir = homedir;
  }

  async copy() {
    const sourceDirPath = `${this.dir}/files`;
    const targetDirPath = `${this.dir}/files_copy`;

    try {
      await fs.cp(sourceDirPath, targetDirPath, {
        recursive: true,
        force: false,
        errorOnExist: true,
      });
    } catch (err) {
      if (["ENOENT", "ERR_FS_CP_EEXIST"].includes(err?.code)) {
        throw new Error(fsErrorText);
      }
    }
  }

  processCommand(inputString) {
    const parts = inputString.split(" ").filter((item) => item.trim())

    const command = parts[0];
    const argsNumber = parts.length > 0 ? parts.length - 1 : 0;

    if (command === ".exit" && !argsNumber) {
      process.exit(0);
    }

    if (command === "cp" && argsNumber)

      this.printdir();
  }

  printdir() {
    console.log(`You are currently in ${this.dir}`);
  }

  printGoodbye = () => {
    console.log(`Thank you for using File Manager, ${this.username}, goodbye!\n`);
  };
}
