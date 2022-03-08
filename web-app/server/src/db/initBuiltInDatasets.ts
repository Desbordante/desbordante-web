import path from "path";
import { FileProps, InputFileFormat } from "../graphql/types/types";
import { FileInfo } from "./models/Authorization/FileInfo";

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

export type BuiltInDatasetInfoType = { fileName: string, datasetProps: FileProps };

export const initBuiltInDatasets = async () => {
    const builtInDatasets: BuiltInDatasetInfoType[] = [
        { fileName: "EpicMeds.csv", datasetProps: { delimiter: "|", hasHeader: true } },
        { fileName: "WDC_age.csv", datasetProps: { delimiter: ",", hasHeader: true } },
        { fileName: "TestLong.csv", datasetProps: { delimiter: ",", hasHeader: true } },
        { fileName: "Workshop.csv", datasetProps: { delimiter: ",", hasHeader: true } },
        { fileName: "breast_cancer.csv", datasetProps: { delimiter: ",", hasHeader: true } },
        { fileName: "CIPublicHighway700.csv", datasetProps: { delimiter: ",", hasHeader: true } },
        {
            fileName: "rules-kaggle.csv", datasetProps: {
                delimiter: ",", hasHeader: false,
                inputFormat: "SINGULAR" as InputFileFormat, tidColumnIndex: 1, itemColumnIndex: 2,
            },
        },
        {
            fileName: "rules-kaggle-rows-2.csv", datasetProps: {
                delimiter: ",", hasHeader: false,
                inputFormat: "TABULAR" as InputFileFormat, hasTid: false,
            },
        },
    ];

    await Promise.all(builtInDatasets.map(async (datasetInfo) =>
        await FileInfo.saveBuiltInDataset(datasetInfo))
    );
};
