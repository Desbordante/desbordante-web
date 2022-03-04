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

function getNumberOfColumns(line: string, sep: string) {
    const re = new RegExp(`\\${sep}`, "g");
    return (line.match(re) || []).length + 1;
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
