import {
  cellLeftRightPadding,
  horizontalSeparatorSymbol,
  verticalLineThickness,
  verticalSeparatorSymbol,
} from "../settings/table.js";
import { colorizeText, printText } from "./texts.js";

export const printTable = (columns, data) => {
  let rowWidth = verticalLineThickness;

  // Calculate column width for every column.
  columns.forEach((column) => {
    column.width = column.label.length;

    data.forEach((item) => {
      const strValue = item[column.fieldName].toString();

      if (strValue.length > column.width) {
        column.width = strValue.length;
      }
    });

    rowWidth += column.width + cellLeftRightPadding * 2 + verticalLineThickness;
  });

  // Print top line for the table.
  printText(repeatSymbol(horizontalSeparatorSymbol, rowWidth));

  // Print table header row.
  let headerRowStr = verticalSeparatorSymbol;

  columns.forEach((column) => {
    headerRowStr += generateCellText(column.label, column.width);
  });

  printText(headerRowStr);

  // Print  line between header and data.
  printText(repeatSymbol(horizontalSeparatorSymbol, rowWidth));

  // Print rows with data.
  data.forEach((item) => {
    let rowStr = verticalSeparatorSymbol;

    columns.forEach((column) => {
      const cellValue = item[column.fieldName].toString();

      rowStr += generateCellText(cellValue, column.width, column.color);
    });

    printText(rowStr);
  });

  // Print bottom line for the table.
  printText(repeatSymbol(horizontalSeparatorSymbol, rowWidth));
};

const repeatSymbol = (symbol, numberOfRepeats) => {
  let str = "";

  for (let i = 1; i <= numberOfRepeats; i++) {
    str += symbol;
  }

  return str;
};

const generateCellText = (cellValue, columnWidth, color) => {
  let cellText = "";

  cellText += repeatSymbol(" ", cellLeftRightPadding);
  cellText += colorizeText(cellValue, color);
  cellText += repeatSymbol(" ", columnWidth - cellValue.length);
  cellText += repeatSymbol(" ", cellLeftRightPadding);
  cellText += verticalSeparatorSymbol;

  return cellText;
};
