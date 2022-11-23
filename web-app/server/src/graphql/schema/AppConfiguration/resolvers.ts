import { Resolvers } from "../../types/types";
import { config } from "../../../config";

export const allowedFDAlgorithms = [
    {
        name: "Pyro",
        properties: {
            hasErrorThreshold: true,
            hasArityConstraint: true,
            isMultiThreaded: true,
        },
    },
    {
        name: "TaneX",
        properties: {
            hasErrorThreshold: true,
            hasArityConstraint: true,
            isMultiThreaded: false,
        },
    },
    {
        name: "FastFDs",
        properties: {
            hasErrorThreshold: false,
            hasArityConstraint: false,
            isMultiThreaded: true,
        },
    },
    {
        name: "FD mine",
        properties: {
            hasErrorThreshold: false,
            hasArityConstraint: false,
            isMultiThreaded: false,
        },
    },
    {
        name: "DFD",
        properties: {
            hasErrorThreshold: false,
            hasArityConstraint: false,
            isMultiThreaded: true,
        },
    },
    {
        name: "Dep Miner",
        properties: {
            hasErrorThreshold: false,
            hasArityConstraint: false,
            isMultiThreaded: false,
        },
    },
    {
        name: "FDep",
        properties: {
            hasErrorThreshold: false,
            hasArityConstraint: false,
            isMultiThreaded: false,
        },
    },
    {
        name: "FUN",
        properties: {
            hasErrorThreshold: false,
            hasArityConstraint: false,
            isMultiThreaded: false,
        },
    },
];

export const allowedCFDAlgorithms = [
    {
        name: "CTane",
        properties: {
            hasArityConstraint: true,
            hasSupport: true,
            hasConfidence: true,
        },
    },
];

export const allowedARAlgorithms = [
    { name: "Apriori", properties: { hasSupport: true, hasConfidence: true } },
];

export const allowedTypoMinerAlgorithms = [
    {
        name: "Typo Miner",
        properties: { ApproxAlgo: "Pyro" },
    },
];

export const allowedStatsAlgorithms = [
    {
        name: "Stats",
        properties: { isMultiThreaded: true },
    },
];

const { appConfig } = config;

export const allowedAlgorithms = new Map([
    ["FD", { algorithms: [...allowedFDAlgorithms] }],
    ["CFD", { algorithms: [...allowedCFDAlgorithms] }],
    ["AR", { algorithms: [...allowedARAlgorithms] }],
    ["TypoFD", { algorithms: [...allowedTypoMinerAlgorithms] }],
    ["TypoCluster", { algorithms: [...allowedTypoMinerAlgorithms] }],
    ["SpecificTypoCluster", { algorithms: [...allowedTypoMinerAlgorithms] }],
    ["Stats", { algorithms: [...allowedStatsAlgorithms] }],
]);

const applicationConfig = {
    allowedFDAlgorithms,
    allowedCFDAlgorithms,
    allowedARAlgorithms,
    fileConfig: appConfig.fileConfig,
    maxThreadsCount: appConfig.maxThreadsCount,
} as const;

export type AlgorithmsConfigType = typeof applicationConfig;

export const AppConfigResolvers: Resolvers = {
    AlgorithmsConfig: {
        allowedDatasets: async (parent, args, { models }) =>
            await models.FileInfo.findBuiltInDatasets(),
    },
    Query: {
        algorithmsConfig: () => applicationConfig,
    },
};
