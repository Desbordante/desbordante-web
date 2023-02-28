import { FileProps, InputFileFormat } from "../graphql/types/types";
import { FileInfo } from "./models/FileData/FileInfo";
import { MainPrimitiveType } from "./models/TaskData/configs/GeneralTaskConfig";

export const getPathToBuiltInDataset = (fileName: string) =>
    `build/target/input_data/${fileName}`;

export type BuiltInDatasetInfoType = {
    fileName: string;
    datasetProps: FileProps;
    supportedPrimitives: MainPrimitiveType[];
};

export const builtInDatasets: BuiltInDatasetInfoType[] = [
    {
        fileName: "TestMetric.csv",
        datasetProps: { delimiter: ",", hasHeader: true },
        supportedPrimitives: ["MFD"],
    },
    {
        fileName: "EpicMeds.csv",
        datasetProps: { delimiter: "|", hasHeader: true },
        supportedPrimitives: ["Stats", "FD", "CFD"],
    },
    {
        fileName: "WDC_age.csv",
        datasetProps: { delimiter: ",", hasHeader: true },
        supportedPrimitives: ["Stats", "FD", "CFD"],
    },
    {
        fileName: "TestLong.csv",
        datasetProps: { delimiter: ",", hasHeader: true },
        supportedPrimitives: ["Stats", "FD", "CFD"],
    },
    {
        fileName: "Workshop.csv",
        datasetProps: { delimiter: ",", hasHeader: true },
        supportedPrimitives: ["Stats", "FD", "CFD", "TypoFD"],
    },
    {
        fileName: "breast_cancer.csv",
        datasetProps: { delimiter: ",", hasHeader: true },
        supportedPrimitives: ["Stats", "FD", "CFD"],
    },
    {
        fileName: "CIPublicHighway700.csv",
        datasetProps: { delimiter: ",", hasHeader: true },
        supportedPrimitives: ["Stats", "FD", "CFD"],
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
        supportedPrimitives: ["Stats", "TypoFD"],
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
