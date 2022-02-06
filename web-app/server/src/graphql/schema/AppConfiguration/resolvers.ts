import { Resolvers } from "../../types/types";

const AppConfigResolvers : Resolvers = {
    AlgorithmsConfig: {
        allowedDatasets: async(parent, args, { models, logger }) => {
            return models.FileInfo.findAll(
                { where: { isBuiltInDataset: true } });
        }
    },
    Query: {
        user: async(parent, { id }, { models, logger }) => {
            return models.User.findOne({ where: { id: id } });
        },

        algorithmsConfig: async (parent, {}, { models, logger }) => {
            return {
                fileConfig: {
                    allowedFileFormats: [
                        "text/csv", "application/vnd.ms-excel"
                    ],
                    allowedSeparators: [
                        ",", "\\t", "\\n", "|", ";"
                    ],
                    maxFileSize: 1e10,
                },
                allowedFDAlgorithms: [
                    {
                        name: "Pyro",
                        properties: { hasErrorThreshold: true, hasArityConstraint: true, isMultiThreaded: true }
                    },
                    {
                        name: "TaneX",
                        properties: { hasErrorThreshold: true, hasArityConstraint: true, isMultiThreaded: false }
                    },
                    {
                        name: "FastFDs",
                        properties: { hasErrorThreshold: false, hasArityConstraint: false, isMultiThreaded: true }
                    },
                    {
                        name: "FD mine",
                        properties: { hasErrorThreshold: false, hasArityConstraint: false, isMultiThreaded: false }
                    },
                    {
                        name: "DFD",
                        properties: { hasErrorThreshold: false, hasArityConstraint: false, isMultiThreaded: false }
                    }
                ],
                allowedCFDAlgorithms: [
                    { name: "CTane", properties: { hasArityConstraint: true, hasSupport: true, hasConfidence: true } },
                ],
            };
        }
    }
}

export = AppConfigResolvers
