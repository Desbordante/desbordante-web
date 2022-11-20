import { IntersectionMainTaskProps, MainPrimitiveType } from "../../../types/types";
import {
    InvalidUserInput,
    TransformedIntersectionSpecificTaskProps,
    TransformedSpecificClusterTaskProps,
} from "./AbstractCreator";
import { ApolloError } from "apollo-server-core";
import { Context } from "../../../types/context";
import { FileInfo } from "../../../../db/models/FileData/FileInfo";
import { SpecificPrimitiveType } from "../../../../db/models/TaskData/configs/GeneralTaskConfig";
import { allowedFDAlgorithms } from "../../AppConfiguration/resolvers";
import config from "../../../../config";
import validator from "validator";
import isUUID = validator.isUUID;

const { maxThreadsCount } = config.appConfig;

type PromiseOrValue<T> = Promise<T> | T;

type SchemaItemType<PropsType, PrimitiveType> = {
    supportedPrimitives: PrimitiveType[];
    isValid: (
        props: PropsType,
        fileInfo: FileInfo,
        context: Context
    ) => PromiseOrValue<boolean>;
    info: InvalidUserInput<PropsType>;
};

export type SchemaType<PropsType, PrimitiveType> = Omit<
    SchemaItemType<PropsType, PrimitiveType>,
    "supportedPrimitives"
>[];

const mainTaskSchema: SchemaItemType<IntersectionMainTaskProps, MainPrimitiveType>[] = [
    {
        supportedPrimitives: ["FD"],
        info: {
            property: "errorThreshold",
            expected: "Decimal between [0..1]",
        },
        isValid: ({ errorThreshold: threshold }) =>
            typeof threshold === "number" && threshold >= 0 && threshold <= 1,
    },
    {
        supportedPrimitives: ["TypoFD"],
        info: {
            property: "errorThreshold",
            expected:
                "Decimal between (0..1] " +
                "(Also TypoFDs mining with errorThreshold = 0 is meaningless)",
        },
        isValid: ({ errorThreshold: threshold }) =>
            typeof threshold === "number" && threshold > 0 && threshold <= 1,
    },
    {
        supportedPrimitives: ["FD", "TypoFD", "CFD"],
        info: {
            property: "maxLHS",
            expected: "Integer greater 0 (or -1 equal infinity)",
        },
        isValid: ({ maxLHS }) =>
            typeof maxLHS === "number" && (maxLHS >= 0 || maxLHS === -1),
    },
    {
        supportedPrimitives: ["FD", "TypoFD"],
        info: {
            property: "threadsCount",
            expected: `Integer between [1..${maxThreadsCount}]`,
        },
        isValid: ({ threadsCount: count }) =>
            typeof count === "number" && count >= 0 && count <= maxThreadsCount,
    },
    {
        supportedPrimitives: ["CFD", "AR"],
        info: {
            property: "minConfidence",
            expected: "Decimal between [0..1]",
        },
        isValid: ({ minConfidence: confidence }) =>
            typeof confidence === "number" && confidence >= 0 && confidence <= 1,
    },
    {
        supportedPrimitives: ["CFD"],
        info: {
            property: "minSupportCFD",
            expected: "Integer between [1..rowsCount]",
        },
        isValid: ({ minSupportCFD: support }, { rowsCount }) =>
            typeof support === "number" && support >= 1 && support <= rowsCount,
    },
    {
        supportedPrimitives: ["AR"],
        info: {
            property: "minSupportAR",
            expected: "Decimal between [0..1]",
        },
        isValid: ({ minSupportAR: support }) =>
            typeof support === "number" && support >= 0 && support <= 1,
    },
    {
        supportedPrimitives: ["TypoFD"],
        info: {
            property: "approximateAlgorithm",
            expected: "Pyro",
        },
        isValid: ({ approximateAlgorithm }) => approximateAlgorithm === "Pyro",
    },
    {
        supportedPrimitives: ["TypoFD"],
        info: {
            property: "preciseAlgorithm",
            expected: `[${allowedFDAlgorithms.map(({ name }) => name).join(", ")}]`,
        },
        isValid: ({ preciseAlgorithm: algo }) =>
            allowedFDAlgorithms.some(({ name }) => name === algo),
    },
    {
        supportedPrimitives: ["TypoFD"],
        info: {
            property: "defaultRadius",
            expected: "Decimal greater 0 (or -1 equal infinity)",
        },
        isValid: ({ defaultRadius }) =>
            typeof defaultRadius === "number" &&
            (defaultRadius > 0 || defaultRadius == -1),
    },
    {
        supportedPrimitives: ["TypoFD"],
        info: {
            property: "defaultRatio",
            expected: "Decimal between [0..1]",
        },
        isValid: ({ defaultRatio }) =>
            typeof defaultRatio === "number" && defaultRatio >= 0 && defaultRatio <= 1,
    },
];

export const getMainTaskSchema = (primitiveType: MainPrimitiveType) => {
    return mainTaskSchema
        .filter(({ supportedPrimitives }) => supportedPrimitives.includes(primitiveType))
        .map(({ isValid, info }) => ({ isValid, info }));
};

const specificTaskSchema: SchemaItemType<
    TransformedIntersectionSpecificTaskProps,
    SpecificPrimitiveType
>[] = [
    {
        supportedPrimitives: ["TypoCluster"],
        info: {
            property: "parentTaskID",
            expected: "Parent task identification (TypoFD)",
        },
        isValid: async ({ parentTaskID: taskID }, _, context) => {
            if (!(typeof taskID === "string" && isUUID(taskID, 4))) {
                return false;
            }
            const parentTask = await context.models.TaskState.findByPk(taskID);
            return !!parentTask;
        },
    },
    {
        supportedPrimitives: ["TypoCluster"],
        info: {
            property: "typoFD",
            expected: "FD from Typo FDs",
        },
        isValid: async ({ parentTaskID: taskID, typoFD }, _, context) => {
            if (typoFD == undefined || typoFD.length == 0 || taskID == undefined) {
                return false;
            }
            const mainTaskResult = await context.models.TypoFDTaskResult.findByPk(
                taskID,
                {
                    attributes: ["deps"],
                }
            );
            if (!mainTaskResult) {
                throw new ApolloError("Results for parent task not found");
            }
            const { deps } = mainTaskResult;
            if (typeof deps !== "string") {
                throw new ApolloError("Main task wasn't processed yet");
            }
            return deps.split(";").includes(typoFD);
        },
    },
    {
        supportedPrimitives: ["TypoCluster"],
        info: {
            property: "radius",
            expected: "Decimal greater 0 (or -1 equal infinity)",
        },
        isValid: ({ radius }) =>
            typeof radius === "number" && (radius > 0 || radius == -1),
    },
    {
        supportedPrimitives: ["TypoCluster"],
        info: {
            property: "ratio",
            expected: "Decimal between [0..1]",
        },
        isValid: ({ ratio }) => typeof ratio === "number" && ratio >= 0 && ratio <= 1,
    },
];

export const getSpecificTaskSchema = (primitiveType: SpecificPrimitiveType) => {
    return specificTaskSchema
        .filter(({ supportedPrimitives }) => supportedPrimitives.includes(primitiveType))
        .map(({ isValid, info }) => ({ isValid, info }));
};

const specificClusterTaskSchema: SchemaType<
    TransformedSpecificClusterTaskProps,
    "SpecificTypoCluster"
> = [
    {
        info: {
            property: "parentTaskID",
            expected: "Parent task identification (TypoCluster)",
        },
        isValid: async ({ parentTaskID: taskID }, _, context) => {
            if (!isUUID(taskID, 4)) {
                return false;
            }
            const parentTask = await context.models.TaskState.findByPk(taskID);
            return !!parentTask;
        },
    },
    {
        info: {
            property: "clusterID",
            expected: "Integer between [1..clusterCount]",
        },
        isValid: async ({ clusterID, parentTaskID }, _, context) => {
            const parentTask = await context.models.TypoClusterResult.findByPk(
                parentTaskID,
                {
                    attributes: ["clustersCount"],
                }
            );
            return (
                parentTask != undefined &&
                clusterID >= 0 &&
                clusterID <= parentTask.clustersCount
            );
        },
    },
];

export const getSpecificClusterTaskSchema = () => specificClusterTaskSchema;
