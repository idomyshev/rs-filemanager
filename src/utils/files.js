import { fileURLToPath } from "url";
import { dirname } from "path";

export const getCurrentDirPath = (url) => {
  const filePath = fileURLToPath(url);
  return dirname(filePath);
};
