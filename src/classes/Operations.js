import { FileManager } from "./FileManager.js";
import { open, stat, readdir, rename } from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { SEPARATOR } from "../settings/filesystem.js";
import { printTable } from "../utils/tables.js";
import { tableColumns } from "../settings/table.js";
import { colorizeText } from "../utils/texts.js";

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
      throw new Error("Target file already exists");
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

  async ls() {
    try {
      const files = [];
      const dirs = [];
      const tableData = [];

      const allFiles = await readdir(this.dir);

      const addTableRow = (index, fileName, isDir) => {
        const item = {
          index,
          fileName,
          fileType: isDir ? "directory" : "file",
        };

        tableData.push(item);
      };

      for (const fileName of allFiles) {
        const filePath = `${this.dir}${SEPARATOR}${fileName}`;
        const isDir = (await stat(filePath)).isDirectory();

        if (isDir) {
          dirs.push(fileName);
        } else {
          files.push(fileName);
        }
      }

      dirs.sort();
      files.sort();

      dirs.forEach((fileName, index) => {
        addTableRow(index, fileName, true);
      });

      files.forEach((fileName, index) => {
        addTableRow(index + dirs.length, fileName, false);
      });

      // Print empty line.
      console.log();

      // Print table.
      printTable(tableColumns, tableData);

      // Print empty line.
      console.log();
    } catch (e) {
      throw new Error("Cannot read dir or stat the file");
    }
  }

  async cat(file1) {
    const sourceFilePath = `${this.dir}/${file1}`;

    await stat(sourceFilePath);

    let summaryData = [];

    const result = await new Promise((resolve) => {
      createReadStream(sourceFilePath)
        .on("data", (data) => {
          summaryData.push(data);
        })
        .on("end", () => {
          resolve(summaryData);
        });
    });

    const resultString = colorizeText(result.toString("utf8"), "yellow");

    process.stdout.write(`\n${resultString}\n\n`);
  }

  async rn(sourceFilePath, targetFilePath) {
    let targetFileExist = false;

    try {
      targetFileExist = await stat(`${this.dir}/${targetFilePath}`);
      targetFileExist = true;
    } catch (err) {
      // It's correct that we do nothing here.
    }

    if (targetFileExist) {
      throw new Error("Target file already exists");
    }

    await rename(
      `${this.dir}/${sourceFilePath}`,
      `${this.dir}/${targetFilePath}`
    );
  }
}
