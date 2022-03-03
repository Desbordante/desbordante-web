import { CsvParserStream, parse } from "fast-csv";
import { Row } from "@fast-csv/parse";
import fs from "fs";

const getFirstRow = (path: any, delimiter: any) => {
    return new Promise(resolve => {
        const parser: CsvParserStream<Row, Row> = parse({ delimiter, maxRows: 1 }) ;
        let firstRow: Row;
        fs.createReadStream(path)
            .pipe(parser)
            .on("Error", (e) => {
                throw e;
            })
            .on("data", (row) => {
                firstRow = row;
            })
            .on("end", () => {
                resolve(firstRow);
            });
    });
};

const findIndexInRange = (arr: any[], obj: any, from: number, to: number) => {
    for (let i = from; i < to; ++i) {
        if (arr[i] === obj) {
            return i;
        }
    }
    return to;
};

export const generateHeaderByPath = async (path: string, hasHeader: boolean, delimiter: string) => {
    try {
        const row: any = await getFirstRow(path, delimiter);
        let header: string[] = [];

        if (!hasHeader) {
            header = [...Array(row.length).keys()].map(i => `Attr ${i}`);
        } else {
            const occurrences: number[] = [...Array(row.length).fill(0)];
            for (let i = 0; i != row.length; ++i) {
                const next = findIndexInRange(row, row[i], i, row.length);
                if (next !== row.length) {
                    occurrences[next] = occurrences[i] + 1;
                }
                header.push(row[i]);
                if (occurrences[i] != 0) {
                    row[i] += ` ${i}`;
                }
            }
        }
        return header;
    } catch (e) {
        throw new Error(`Problem with generating new header: ${e}`);
    }
};
