import path from "path";

import { FileProps, InputFileFormat } from "../graphql/types/types";
import { FileInfo } from "./models/FileInfo/FileInfo";
import { PrimitiveType } from "./models/TaskData/BaseTaskConfig";

export const getPathToBuiltInDataset = (fileName: string) => {
    if (!require.main) {
        throw Error("FATAL SERVER ERROR");
    }
    const rootPath = path.dirname(require.main.filename).split("/");
    rootPath.pop();
    rootPath.pop(); // remove folder 'bin'
    rootPath.pop(); // remove folder 'server'
    rootPath.pop(); // remove folder 'web-app'
    rootPath.push("build"); // add folder 'build'
    rootPath.push("target"); // add folder 'target'
    rootPath.push("inputData"); // add folder 'inputData'
    rootPath.push(fileName); // add file '*.csv'
    return rootPath.join("/");
};

export type BuiltInDatasetInfoType = { fileName: string, datasetProps: FileProps, supportedPrimitives: PrimitiveType[] };
export const builtInDatasets: BuiltInDatasetInfoType[] = [
    { fileName: "EpicMeds.csv", datasetProps: { delimiter: "|", hasHeader: true }, supportedPrimitives: ["FD", "CFD"] },
    { fileName: "WDC_age.csv", datasetProps: { delimiter: ",", hasHeader: true }, supportedPrimitives: ["FD", "CFD"] },
    { fileName: "TestLong.csv", datasetProps: { delimiter: ",", hasHeader: true }, supportedPrimitives: ["FD", "CFD"] },
    { fileName: "Workshop.csv", datasetProps: { delimiter: ",", hasHeader: true }, supportedPrimitives: ["FD", "CFD"] },
    { fileName: "breast_cancer.csv", datasetProps: { delimiter: ",", hasHeader: true }, supportedPrimitives: ["FD", "CFD"] },
    { fileName: "CIPublicHighway700.csv", datasetProps: { delimiter: ",", hasHeader: true }, supportedPrimitives: ["FD", "CFD"] },
    {
        fileName: "rules-kaggle.csv", datasetProps: {
            delimiter: ",", hasHeader: false,
            inputFormat: "SINGULAR" as InputFileFormat, tidColumnIndex: 1, itemColumnIndex: 2,
        },
        supportedPrimitives: ["AR"],
    },
    {
        fileName: "rules-kaggle-rows-2.csv", datasetProps: {
            delimiter: ",", hasHeader: false,
            inputFormat: "TABULAR" as InputFileFormat, hasTid: false,
        },
        supportedPrimitives: ["AR"],
    },
];

export const initBuiltInDatasets = async () =>
    await Promise.all(builtInDatasets.map(async (datasetInfo) =>
        await FileInfo.saveBuiltInDataset(datasetInfo)))
        .then(() => console.debug("BuiltIn datasets was initialized"))
        .catch(err => new Error(`Error while initializing built-in datasets ${err.message}`));
