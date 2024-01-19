import {FileManager} from "./FileManager.js";
import {open, stat} from "fs/promises";
import {createReadStream, createWriteStream} from "fs";

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
    const targetPath = `${this.dir}/${file1}`;


    try {
      const file = await open(targetPath, "wx");
      file.close();
    } catch (err) {
      throw new Error;
    }
  }
}