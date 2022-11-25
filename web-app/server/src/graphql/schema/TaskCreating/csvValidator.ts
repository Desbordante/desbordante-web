import { GraphQLError } from "graphql";
import config from "../../../config";
import fs from "fs";
import readline from "readline";

function csvLinetoArray(line: string, sep: string) {
    if (sep == "|") {
        sep = "\\|";
    }
    const re_valid = new RegExp(
        `^\\s*(?:'[^'\\\\]*(?:\\\\[\\S\\s][^'\\\\]*)*'|"[^"\\\\]*(?:\\\\[\\S\\s][^"\\\\]*)*"|[^${sep}'"\\s\\\\]*(?:\\s+[^${sep}'"\\s\\\\]+)*)\\s*(?:${sep}\\s*(?:'[^'\\\\]*(?:\\\\[\\S\\s][^'\\\\]*)*'|"[^"\\\\]*(?:\\\\[\\S\\s][^"\\\\]*)*"|[^${sep}'"\\s\\\\]*(?:\\s+[^${sep}'"\\s\\\\]+)*)\\s*)*$`
    );
    const re_value = new RegExp(
        `(?!\\s*$)\\s*(?:'([^'\\\\]*(?:\\\\[\\S\\s][^'\\\\]*)*)'|"([^"\\\\]*(?:\\\\[\\S\\s][^"\\\\]*)*)"|([^${sep}'"\\s\\\\]*(?:\\s+[^${sep}'"\\s\\\\]+)*))\\s*(?:${sep}|$)`,
        "g"
    );

    if (!re_valid.test(line)) {
        throw new GraphQLError("Invalid csv string was provided", {
            extensions: { code: "UserInputError", line },
        });
    }
    const a = [];
    line.replace(re_value, (m0, m1, m2, m3) => {
        if (m1 !== undefined) {
            a.push(m1.replace(/\\'/g, "'"));
        } else if (m2 !== undefined) {
            a.push(m2.replace(/\\"/g, '"'));
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
    if (lines.length < 4) {
        return null;
    }

    const checkSeparator = (sep: string, lines: string[]) => {
        let countOfColumns = -1;
        for (const line of lines) {
            const curColsNumber = getNumberOfColumns(line, sep);
            if (
                curColsNumber === 1 ||
                (~countOfColumns && countOfColumns !== curColsNumber)
            ) {
                return false;
            }
            countOfColumns = curColsNumber;
        }
        return true;
    };
    const { fileConfig } = config.appConfig;
    for (const sep of fileConfig.allowedDelimiters) {
        if (checkSeparator(sep, lines)) {
            return sep;
        }
    }
    return null;
}

export type TabularFileFormatProps = {
    inputFormat: "TABULAR";
    hasTid: boolean;
};

export type SingularFileFormatProps = {
    inputFormat: "SINGULAR";
    tidColumnIndex: number;
    itemColumnIndex: number;
};

export const findRowsAndColumnsNumber = async (
    path: fs.PathLike,
    sep: string,
    fileFormat: TabularFileFormatProps | SingularFileFormatProps | undefined = undefined
) => {
    const fileStream = fs.createReadStream(path);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    let rowsCount = 0;
    let countOfColumns: null | number = -1;
    for await (const line of rl) {
        rowsCount++;
        const cols = csvLinetoArray(line, sep);
        const curColsNumber = cols.length;
        if (!fileFormat && curColsNumber === 1) {
            const sep = await tryFindCorrectSeparator(path);
            let errorMessage =
                "Either the table has 1 column or" +
                " an invalid delimiter is specified.";
            if (sep) {
                errorMessage += ` Maybe you want to provide delimiter '${sep}'`;
            }
            throw new GraphQLError(errorMessage, {
                extensions: { code: "UserInputError" },
            });
        }
        if (!fileFormat && ~countOfColumns && countOfColumns !== curColsNumber) {
            throw new GraphQLError(
                `Row ${rowsCount} has ${curColsNumber} columns, ` +
                    `but row ${rowsCount - 1} has ${countOfColumns} columns.`,
                {
                    extensions: { code: "UserInputError" },
                }
            );
        } else if (
            fileFormat &&
            fileFormat.inputFormat === "SINGULAR" &&
            ~countOfColumns &&
            countOfColumns <
                Math.max(fileFormat.tidColumnIndex, fileFormat.itemColumnIndex)
        ) {
            throw new GraphQLError(
                `Row ${rowsCount} has ${curColsNumber} cols, ` +
                    "but it must be less, than Tid column index and Item column index",
                {
                    extensions: { code: "UserInputError" },
                }
            );
        } else if (
            fileFormat &&
            fileFormat.inputFormat === "TABULAR" &&
            ~countOfColumns &&
            fileFormat.hasTid &&
            (countOfColumns < 2 || Number.isNaN(Number.parseInt(cols[0], 10)))
        ) {
            if (countOfColumns < 2) {
                throw new GraphQLError(
                    `Row ${rowsCount} has ${curColsNumber} cols, ` +
                        "but it must have more, than 1 columns (tid and items columns)",
                    {
                        extensions: { code: "UserInputError" },
                    }
                );
            } else {
                throw new GraphQLError(
                    `Expected, that ${cols[0]} is integer ` +
                        ` (Transaction column id is ${1})`,
                    {
                        extensions: { code: "UserInputError" },
                    }
                );
            }
        } else {
            countOfColumns = curColsNumber;
        }
    }
    countOfColumns = fileFormat ? null : countOfColumns;
    return { rowsCount, countOfColumns };
};

export const createTabularFileFromSingular = async (
    path: fs.PathLike,
    sep: string,
    tidColumnIndex: number,
    itemColumnIndex: number
) => {
    const fileStream = fs.createReadStream(path);
    const newPath = path.toString().replace(".csv", "_SINGULAR.csv");
    const writeFileStream = fs.createWriteStream(newPath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    const usedTids = new Set<number>();
    const currentItemset = new Array<string>();
    let currentTid: number | undefined;
    for await (const line of rl) {
        const columns = csvLinetoArray(line, sep);
        const tid = parseInt(columns[tidColumnIndex - 1], 10);
        if (Number.isNaN(tid)) {
            throw new GraphQLError(
                `Incorrect line ${line}.` +
                    ` Expected, that ${columns[tidColumnIndex - 1]} is integer value`,
                {
                    extensions: { code: "UserInputError" },
                }
            );
        }
        const item = columns[itemColumnIndex - 1];
        if (currentTid === undefined) {
            currentTid = tid;
        }
        if (tid === currentTid) {
            currentItemset.push(item);
        } else if (!usedTids.has(currentTid)) {
            usedTids.add(currentTid);
            writeFileStream.write(`${currentTid},${currentItemset.join(",")}\n`);
            while (currentItemset.length) {
                currentItemset.pop();
            }
            currentTid = tid;
            currentItemset.push(item);
        } else {
            throw new GraphQLError(
                "It was expected that all records for a " +
                    `transaction with tid '${currentTid}' would go sequentially`,
                {
                    extensions: { code: "UserInputError" },
                }
            );
        }
    }
    if (currentTid !== undefined && !usedTids.has(currentTid)) {
        usedTids.add(currentTid);
        writeFileStream.write(`${currentTid},${currentItemset.join(",")}\n`);
    } else {
        throw new GraphQLError(
            "It was expected that all records for a transaction" +
                `with tid '${currentTid}' would go sequentially`,
            {
                extensions: { code: "UserInputError" },
            }
        );
    }
    return newPath;
};
