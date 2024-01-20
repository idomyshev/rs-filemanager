import { FileManager } from "./FileManager.js";
import { open, stat } from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { SEPARATOR } from "../settings/filesystem.js";

function handleError(e) {
  throw e;
}

export class Operations extends FileManager {
  async cp(file1, file2) {
    const sourceFilePath = `${this.dir}/${file1}`;
    const targetFilePath = `${this.dir}/${file2}`;

    await stat(sourceFilePath);

    let targetFileExist = false;

    try {
      targetFileExist = await stat(targetFilePath);
      targetFileExist = true;
    } catch (err) {
      // It's correct that we do nothing here.
    }

    if (targetFileExist) {
      throw new Error("TARGET EXISTS");
    }

    const readStream = createReadStream(sourceFilePath);
    const writeStream = createWriteStream(targetFilePath);

    readStream.pipe(writeStream);
  }

  async add(file1) {
    const targetFilePath = `${this.dir}/${file1}`;

    try {
      const file = await open(targetFilePath, "wx");
      file.close();
    } catch (err) {
      throw new Error(`Cannot open file ${targetFilePath}`);
    }
  }

  async up() {
    const path = this.dir;

    // TODO Improve it: on Windows / and \ is possible, probably?
    const isWindows = SEPARATOR !== "/";

    const pathSplit = path.split(SEPARATOR);

    if (isWindows) {
      // Next if: Check the case when we are in root folder (i.e. C:\, D:\, etc)
      if (pathSplit.length === 1) {
        return;
      }

      pathSplit.pop();
      this.dir =
        pathSplit.length > 1
          ? pathSplit.join(SEPARATOR)
          : `${pathSplit[0]}${SEPARATOR}`;
      return;
    }

    // Below is Linux case.
    if (path === SEPARATOR) {
      return;
    }

    pathSplit.pop();
    pathSplit.shift();
    this.dir = `${SEPARATOR}${pathSplit.join(SEPARATOR)}`;
  }

  async cd(path) {
    // TODO Improve it: on Windows / and \ is possible, probably?
    const isWindowsAbsolutePath =
      path.search(/^[a-zA-Z]+:\\/g) > -1 && SEPARATOR !== "/";

    const isLinuxAbsolutePath = SEPARATOR === "/" && path.startsWith(SEPARATOR);

    // Add path to the current if path is not absolute.
    if (!isLinuxAbsolutePath && !isWindowsAbsolutePath) {
      path = `${this.dir}${SEPARATOR}${path}`;
    }

    const res = await stat(path);

    if (!res.isDirectory()) {
      throw new Error("Given path is not a directory");
    }

    this.dir = path.replace(/\/+$/g, "");
  }
}
