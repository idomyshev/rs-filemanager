export const colorizeText = (text, color) => {
  switch (color) {
    case "red":
      return `\x1b[91m${text}\x1b[0m`;
    case "yellow":
      return `\x1b[33m${text}\x1b[0m`;
    case "white":
      return `\x1b[97m${text}\x1b[0m`;
    default:
      return text;
  }
}

export const printText = (text, color) => {
  console.log(colorizeText(text, color));
}