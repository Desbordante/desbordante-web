import { Resolvers } from "../../types/types";
import { builtInDatasets } from "../../../db/initBuiltInDatasets";

export const allowedFDAlgorithms = [
    { name: "Pyro", properties: { hasErrorThreshold: true, hasArityConstraint: true, isMultiThreaded: true } },
    { name: "TaneX", properties: { hasErrorThreshold: true, hasArityConstraint: true, isMultiThreaded: false } },
    { name: "FastFDs",  properties: { hasErrorThreshold: false, hasArityConstraint: false, isMultiThreaded: true } },
    { name: "FD mine", properties: { hasErrorThreshold: false, hasArityConstraint: false, isMultiThreaded: false } },
    { name: "DFD", properties: { hasErrorThreshold: false, hasArityConstraint: false, isMultiThreaded: true } },
    { name: "Dep Miner", properties: { hasErrorThreshold: false, hasArityConstraint: false, isMultiThreaded: false } },
    { name: "FDep", properties: { hasErrorThreshold: false, hasArityConstraint: false, isMultiThreaded: false } },
];
export const allowedCFDAlgorithms = [
    { name: "CTane", properties: { hasArityConstraint: true, hasSupport: true, hasConfidence: true } },
];

export const allowedARAlgorithms = [
    { name: "Apriori", properties: { hasSupport: true, hasConfidence: true } },
];

export const allowedTypoMinerAlgorithm = {
    name: "Typo Miner", properties: { ApproxAlgo: "Pyro" },
};

export const fileConfig = {
    allowedFileFormats: ["text/csv", "application/vnd.ms-excel"],
    allowedDelimiters: [",", "\\t", "\\n", "|", ";"],
    maxFileSize: 1e10,
};

export const maxThreadsCount = Number(process.env.MAX_THREADS_COUNT);

export const AppConfigResolvers: Resolvers = {
    AlgorithmsConfig: {
        // @ts-ignore
        allowedDatasets: async (parent, args, { models }) => {
            const datasets = await models.FileInfo.findAll({ where: { isBuiltIn: true } });
            return datasets.filter(({ fileName }) => builtInDatasets.find(info => info.fileName === fileName));
        },
    },
    Query: {
        algorithmsConfig: async () =>
            ({
                fileConfig,
                allowedFDAlgorithms, allowedCFDAlgorithms, allowedARAlgorithms,
                maxThreadsCount,
            }),
    },
};
