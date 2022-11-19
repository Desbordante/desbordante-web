import { FileProps, InputFileFormat } from "../graphql/types/types";
import { FileInfo } from "./models/FileData/FileInfo";
import { MainPrimitiveType } from "./models/TaskData/configs/GeneralTaskConfig";
import path from "path";

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
    rootPath.push("input_data"); // add folder 'input_data'
    rootPath.push(fileName); // add file '*.csv'
    return rootPath.join("/");
};

export type BuiltInDatasetInfoType = {
    fileName: string;
    datasetProps: FileProps;
    supportedPrimitives: MainPrimitiveType[];
};

export const builtInDatasets: BuiltInDatasetInfoType[] = [
    {
        fileName: "EpicMeds.csv",
        datasetProps: { delimiter: "|", hasHeader: true },
        supportedPrimitives: ["FD", "CFD"],
    },
    {
        fileName: "WDC_age.csv",
        datasetProps: { delimiter: ",", hasHeader: true },
        supportedPrimitives: ["FD", "CFD"],
    },
    {
        fileName: "TestLong.csv",
        datasetProps: { delimiter: ",", hasHeader: true },
        supportedPrimitives: ["FD", "CFD"],
    },
    {
        fileName: "Workshop.csv",
        datasetProps: { delimiter: ",", hasHeader: true },
        supportedPrimitives: ["FD", "CFD", "TypoFD"],
    },
    {
        fileName: "breast_cancer.csv",
        datasetProps: { delimiter: ",", hasHeader: true },
        supportedPrimitives: ["FD", "CFD"],
    },
    {
        fileName: "CIPublicHighway700.csv",
        datasetProps: { delimiter: ",", hasHeader: true },
        supportedPrimitives: ["FD", "CFD"],
    },
    {
        fileName: "rules-kaggle-rows-2.csv",
        datasetProps: {
            delimiter: ",",
            hasHeader: false,
            inputFormat: "TABULAR" as InputFileFormat,
            hasTid: false,
        },
        supportedPrimitives: ["AR"],
    },
    {
        fileName: "SimpleTypos.csv",
        datasetProps: { delimiter: ",", hasHeader: true },
        supportedPrimitives: ["TypoFD"],
    },
];

export const initBuiltInDatasets = async () =>
    await Promise.all(
        builtInDatasets.map(
            async (datasetInfo) => await FileInfo.saveBuiltInDataset(datasetInfo)
        )
    )
        .then(() => console.debug("BuiltIn datasets was initialized"))
        .catch(
            (err) =>
                new Error(`Error while initializing built-in datasets ${err.message}`)
        );
