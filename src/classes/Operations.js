import {FileManager} from "./FileManager.js";
import {open, stat, readdir, rename, unlink, readFile} from "fs/promises";
import {createReadStream, createWriteStream} from "fs";
import {homedir, EOL, cpus, userInfo, arch} from "os";
import crypto from "crypto";
import { createBrotliCompress, createBrotliDecompress } from 'zlib';

import {SEPARATOR} from "../settings/filesystem.js";
import {printTable} from "../utils/tables.js";
import {tableColumns} from "../settings/table.js";
import {colorizeText, printText} from "../utils/texts.js";

export class Operations extends FileManager {
  async cp(filePath1, targetDirPath) {
    const sourceFilePath = this.transformPath(filePath1);
    const targetFileDir = this.transformPath(targetDirPath);

    const sourceFile = filePath1.split(SEPARATOR);
    const sourceFileName = sourceFile[sourceFile.length - 1];

    await stat(sourceFilePath);
    const targetDirStat = await stat(targetFileDir);

    if (!targetDirStat.isDirectory()) {
      throw new Error("Target is not a directory");
    }

    let targetFileExist = false;

    const targetFilePath = targetFileDir + SEPARATOR + sourceFileName;

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

  async mv(filePath1, targetDirPath) {
    await this.cp(filePath1, targetDirPath);
    setTimeout(() =>  this.rm(filePath1), 500);
  }

  async add(filePath) {
    const targetFilePath = this.transformPath(filePath);

    try {
      const file = await open(targetFilePath, "wx");
      await file.close();
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
    path = this.transformPath(path);

    const res = await stat(path);

    if (!res.isDirectory()) {
      throw new Error("Given path is not a directory");
    }

    if (path === SEPARATOR) {
      this.dir = path
    } else {
      this.dir = path.replace(/\/+$/g, "");
    }
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

  async cat(filePath) {
    const sourceFilePath = this.transformPath(filePath);

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

    process.stdout.write(`${EOL}${resultString}${EOL}${EOL}`);
  }

  async rn(sourceFilePath, targetFilePath) {
    sourceFilePath = this.transformPath(sourceFilePath);
    targetFilePath = this.transformPath(targetFilePath);

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

    await rename(sourceFilePath, targetFilePath);
  }

  async rm(filePath) {
    filePath = this.transformPath(filePath);

    await unlink(filePath);
  }

  async os(arg) {
    arg = arg.trim();

    const prefix = arg.substring(0, 2);
    const command = arg.substring(2, arg.length);

    if (prefix !== "--") {
      throw new Error("Argument specified incorrectly");
    }

    const printResult = (text) => {
      printText(text, "yellow");
    };

    switch (command) {
      case "EOL":
        console.log(JSON.stringify(EOL));
        break;
      case "cpus":
        console.log(cpus());
        break;
      case "homedir":
        printResult(homedir());
        break;
      case "username":
        printResult(userInfo().username);
        break;
      case "architecture":
        printResult(arch());
        break;
      default:
        throw new Error("Command is not recognized");
    }
  }

  async hash(filePath) {
    filePath = this.transformPath(filePath);

    const data = await readFile(filePath);

    const hashHex = crypto.createHash("sha256").update(data).digest("hex");

    printText(hashHex, "yellow");
  }

  async compress(filePath1, filePath2) {
    const sourceFilePath = this.transformPath(filePath1);
    const targetFilePath = this.transformPath(filePath2);

    await stat(sourceFilePath);

    const inputStream = createReadStream(sourceFilePath);
    const outputStream = createWriteStream(targetFilePath);

    const brotliStream = createBrotliCompress();

    inputStream.pipe(brotliStream).pipe(outputStream);

    outputStream.on('finish', () => {
      console.log('Compression finished');
    });
  }

  async decompress(filePath1, filePath2) {
    const sourceFilePath = this.transformPath(filePath1);
    const targetFilePath = this.transformPath(filePath2);

    await stat(sourceFilePath);

    const inputStream = createReadStream(sourceFilePath);
    const outputStream = createWriteStream(targetFilePath);

    const brotliStream = createBrotliDecompress();

    inputStream.pipe(brotliStream).pipe(outputStream);

    outputStream.on('finish', () => {
      console.log('Decompression finished');
    });
  }
}
