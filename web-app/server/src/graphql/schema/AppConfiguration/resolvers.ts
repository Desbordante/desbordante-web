import { Resolvers } from "../../types/types";

export const allowedFDAlgorithms = [
    { name: "Pyro", properties: { hasErrorThreshold: true, hasArityConstraint: true, isMultiThreaded: true } },
    { name: "TaneX", properties: { hasErrorThreshold: true, hasArityConstraint: true, isMultiThreaded: false } },
    { name: "FastFDs",  properties: { hasErrorThreshold: false, hasArityConstraint: false, isMultiThreaded: true } },
    { name: "FD mine", properties: { hasErrorThreshold: false, hasArityConstraint: false, isMultiThreaded: false } },
    { name: "DFD", properties: { hasErrorThreshold: false, hasArityConstraint: false, isMultiThreaded: false } },
];
export const allowedCFDAlgorithms = [
    { name: "CTane", properties: { hasArityConstraint: true, hasSupport: true, hasConfidence: true } },
];

export const AppConfigResolvers: Resolvers = {
    AlgorithmsConfig: {
        allowedDatasets: async(parent, args, { models, logger }) => {
            const options = { where: { isBuiltIn: true }, attributes: ["ID"] };
            return await models.FileInfo.findAll(options)
                .then(files => files.map(file => ({ fileID: file.ID })));
        },
    },
    Query: {
        algorithmsConfig: async (parent, __, { models, logger }) => {
            return {
                fileConfig: {
                    allowedFileFormats: ["text/csv", "application/vnd.ms-excel"],
                    allowedDelimiters: [",", "\\t", "\\n", "|", ";"],
                    maxFileSize: 1e10,
                },
                allowedFDAlgorithms,
                allowedCFDAlgorithms,
            };
        },
    },
};
