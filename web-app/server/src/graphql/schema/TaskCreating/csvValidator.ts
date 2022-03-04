import { UserInputError } from "apollo-server-core";
import fs from "fs";
import readline from "readline";
import { ModelsType } from "../../../db/models";
import { FileInfo } from "../../../db/models/Authorization/FileInfo";
import { fileConfig } from "../AppConfiguration/resolvers";

export async function findAndUpdateFileRowsCount(file: FileInfo, sep: string) {
    const rowsCount = await processLineByLine(file.path, sep);
    await file.update({ rowsCount });
    return true;
}

function csvLinetoArray(line: string, sep: string) {
    const re_valid = new RegExp(`^\\s*(?:'[^'\\\\]*(?:\\\\[\\S\\s][^'\\\\]*)*'|"[^"\\\\]*(?:\\\\[\\S\\s][^"\\\\]*)*"|[^${sep}'"\\s\\\\]*(?:\\s+[^${sep}'"\\s\\\\]+)*)\\s*(?:${sep}\\s*(?:'[^'\\\\]*(?:\\\\[\\S\\s][^'\\\\]*)*'|"[^"\\\\]*(?:\\\\[\\S\\s][^"\\\\]*)*"|[^${sep}'"\\s\\\\]*(?:\\s+[^${sep}'"\\s\\\\]+)*)\\s*)*$`);
    const re_value = new RegExp(`(?!\\s*$)\\s*(?:'([^'\\\\]*(?:\\\\[\\S\\s][^'\\\\]*)*)'|"([^"\\\\]*(?:\\\\[\\S\\s][^"\\\\]*)*)"|([^${sep}'"\\s\\\\]*(?:\\s+[^${sep}'"\\s\\\\]+)*))\\s*(?:${sep}|$)`, "g");

    if (!re_valid.test(line)) {
        throw new UserInputError("Invalid csv string was provided", { line });
    }
    const a = [];
    line.replace(re_value, (m0, m1, m2, m3) => {
        if (m1 !== undefined) {
            a.push(m1.replace(/\\'/g, "'"));
        } else if (m2 !== undefined) {
            a.push(m2.replace(/\\"/g, "\""));
        } else if (m3 !== undefined) {
            a.push(m3);
        }
        return "";
    });
    if (/,\s*$/.test(line)) {
        a.push("");
    }
    return a;
}

function getNumberOfColumns(line: string, sep: string) {
    return csvLinetoArray(line, sep).length;
}

async function tryFindCorrectSeparator(path: fs.PathLike) {
    const fileStream = fs.createReadStream(path);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    const lines: string[] = [];
    for await (const line of rl) {
        lines.push(line);
        if (lines.length === 5) {
            break;
        }
    }
    if (lines.length < 3) {
        return null;
    }

    const checkSeparator = (sep: string, lines: string[]) => {
        let countOfColumns = -1;
        for (const line of lines) {
            const curColsNumber = getNumberOfColumns(line, sep);
            if (curColsNumber === 1
                || ~countOfColumns && countOfColumns !== curColsNumber) {
                return false;
            }
            countOfColumns = curColsNumber;
        }
        return true;
    };
    for (const sep of fileConfig.allowedDelimiters) {
        if (checkSeparator(sep, lines)) {
            return sep;
        }
    }
    return null;
}

async function processLineByLine(path: fs.PathLike, sep: string) {
    const fileStream = fs.createReadStream(path);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    let linesCount = 0;
    let countOfColumns = -1;
    for await (const line of rl) {
        linesCount++;
        const curColsNumber = getNumberOfColumns(line, sep);
        if (curColsNumber === 1) {
            const sep: string | null = await tryFindCorrectSeparator(path);
            let errorMessage = "Either the table has 1 column or an invalid delimiter is specified.";
            if (sep) {
                errorMessage += ` Maybe you want to provide delimiter ${sep}`;
            }
            throw new UserInputError(errorMessage);
        }
        if (~countOfColumns) {
            if (countOfColumns !== curColsNumber) {
                throw new UserInputError(`Row ${linesCount} has ${curColsNumber} columns, but row ${linesCount - 1} has ${countOfColumns} columns.`);
            }
        } else {
            countOfColumns = curColsNumber;
        }
    }
    return linesCount;
}
