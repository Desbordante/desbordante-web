import { BelongsTo, Column, ForeignKey, IsUUID, Model, Table } from "sequelize-typescript";
import { FLOAT, INTEGER, REAL, STRING, UUID } from "sequelize";
import {
    allowedARAlgorithms,
    allowedCFDAlgorithms,
    allowedFDAlgorithms, allowedTypoMinerAlgorithm, maxThreadsCount,
} from "../../../graphql/schema/AppConfiguration/resolvers";
import { IntersectionTaskProps } from "../../../graphql/types/types";
import { TaskState } from "./TaskState";
import { TypoClusterResult, TypoFDTaskResult } from "./SpecificTaskResults";
import { ApolloError } from "apollo-server-core";
import { PrimitiveType } from "./TaskConfig";

const getSpecificConfigTableName = (primitive: PrimitiveType) => `${primitive}TasksConfig` as const;
const getTableOptions = (primitive: PrimitiveType) =>
    ({ tableName: getSpecificConfigTableName(primitive), updatedAt: false, paranoid: true } as const);

export type IsPropsValidFunctionType = (props: IntersectionTaskProps) =>
    Promise<{ isValid: true } | { errorMessage: string, isValid: false }>;

class BaseSpecificTaskConfig extends Model {
    @IsUUID(4)
    @ForeignKey(() => TaskState)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskState)
    taskState!: TaskState;
}

@Table(getTableOptions("FD"))
export class FDTaskConfig extends BaseSpecificTaskConfig {
    @Column({ type: REAL, allowNull: false })
    errorThreshold!: number;

    @Column({ type: INTEGER, allowNull: false })
    maxLHS!: number;

    @Column({ type: INTEGER, allowNull: false })
    threadsCount!: number;

    static isPropsValid: IsPropsValidFunctionType = async (props) => {
        const { algorithmName, errorThreshold, maxLHS, threadsCount } = props;
        let errorMessage: string | undefined;
        if (!~allowedFDAlgorithms.findIndex(({ name }) => algorithmName === name)) {
            errorMessage = `Algorithm name ${algorithmName} not found`;
        } else if (typeof errorThreshold !== "number" || errorThreshold <= 0 || errorThreshold > 1) {
            errorMessage = `Error threshold isn't valid ${errorThreshold} (0 < e <= 1)`;
        } else if (typeof maxLHS !== "number" || maxLHS < -1) {
            errorMessage = `maxLHS ${maxLHS} isn't valid`;
        } else if (typeof threadsCount !== "number" || threadsCount < 1 || threadsCount > maxThreadsCount) {
            errorMessage = `threadsCount ${threadsCount} isn't valid (min = 1, max = ${maxThreadsCount})`;
        }
        return errorMessage? { isValid: false, errorMessage } : { isValid: true };
    };
}

@Table(getTableOptions("CFD"))
export class CFDTaskConfig extends BaseSpecificTaskConfig {
    @Column({ type: INTEGER, allowNull: false })
    maxLHS!: number;

    @Column({ type: INTEGER, allowNull: false })
    minSupportCFD!: number;

    @Column({ type: REAL, allowNull: false })
    minConfidence!: number;

    static isPropsValid : IsPropsValidFunctionType = async (props) => {
        const { algorithmName, maxLHS, minConfidence, minSupportCFD } = props;
        let errorMessage: string | undefined;
        if (!~allowedCFDAlgorithms.findIndex(({ name }) => algorithmName === name)) {
            errorMessage = `Algorithm name ${algorithmName} not found`;
        } else if (typeof minConfidence !== "number" || minConfidence < 0 || minConfidence > 1) {
            errorMessage = `minConfidence ${minConfidence} isn't valid`;
        } else if (typeof maxLHS !== "number" || maxLHS < -1) {
            errorMessage = `maxLHS ${maxLHS} isn't valid`;
        } else if (typeof minSupportCFD !== "number" || minSupportCFD < 1) {
            errorMessage = `minSupportCFD ${minSupportCFD} isn't valid`;
        }
        return errorMessage? { isValid: false, errorMessage } : { isValid: true };
    };
}

@Table(getTableOptions("AR"))
export class ARTaskConfig extends BaseSpecificTaskConfig {
    @Column({ type: REAL, allowNull: false })
    minSupportAR!: number;

    @Column({ type: REAL, allowNull: false })
    minConfidence!: number;

    static isPropsValid: IsPropsValidFunctionType = async (props) => {
        const { algorithmName, minConfidence, minSupportAR } = props;
        let errorMessage: string | undefined;
        if (!~allowedARAlgorithms.findIndex(({ name }) => algorithmName === name)) {
            errorMessage = `Algorithm name ${algorithmName} not found`;
        } else if (typeof minConfidence !== "number" || minConfidence < 0 || minConfidence > 1) {
            errorMessage = `minConfidence ${minConfidence} isn't valid`;
        } else if (typeof minSupportAR !== "number" || minSupportAR > 1 || minSupportAR < 0) {
            errorMessage = `minConfidence ${minSupportAR} isn't valid`;
        }
        return errorMessage? { isValid: false, errorMessage } : { isValid: true };
    };
}

const ALL_METRICS = ["LEVENSHTEIN", "MODULUS_OF_DIFFERENCE"] as const;
type MetricType = typeof ALL_METRICS[number];

@Table(getTableOptions("TypoFD"))
export class TypoFDTaskConfig extends BaseSpecificTaskConfig {
    @Column({ type: REAL, allowNull: false })
    errorThreshold!: number;

    @Column({ type: INTEGER, allowNull: false })
    maxLHS!: number;

    @Column({ type: INTEGER, allowNull: false })
    threadsCount!: number;

    @Column({ type: STRING, allowNull: false })
    preciseAlgorithm!: string;

    @Column({ type: STRING, allowNull: false })
    approximateAlgorithm!: string;

    @Column({ type: STRING, allowNull: false })
    metric!: MetricType;

    @Column({ type: FLOAT, allowNull: false })
    radius!: number;

    @Column({ type: FLOAT, allowNull: false })
    ratio!: number;

    static isPropsValid: IsPropsValidFunctionType = async (props) => {
        const { algorithmName, preciseAlgorithm, approximateAlgorithm,
            metric, radius, ratio } = props;
        let errorMessage: string | undefined;
        if (algorithmName !== allowedTypoMinerAlgorithm.name) {
            errorMessage = `Received incorrect algorithm name ${algorithmName}`
                + `, expected: ${allowedTypoMinerAlgorithm.name}`;
        } else if (approximateAlgorithm != "Pyro") {
            errorMessage = `Received incorrect approximate algorithm name ${approximateAlgorithm}`
                + `, expected: ${allowedTypoMinerAlgorithm.name}`;
        } else if (!preciseAlgorithm) {
            errorMessage = `Received incorrect approximate algorithm name ${preciseAlgorithm}`;
        } else if (metric === undefined) {
            errorMessage = "Received undefined metric";
        } else if (typeof radius !== "number" || (radius < 0 && radius !== -1)) {
            errorMessage = `Received incorrect radius ${radius}`;
        } else if (typeof ratio !== "number" || ratio < 0 || ratio > 1) {
            errorMessage = `Received incorrect ratio ${ratio} (min = 0, max = 1)`;
        } else {
            props.algorithmName = preciseAlgorithm;
            const isFdAlgoValid = await FDTaskConfig.isPropsValid(props);
            const { isValid } = isFdAlgoValid;
            if (!isValid) {
                ({ errorMessage } = isFdAlgoValid);
            }
            props.algorithmName = algorithmName;
        }
        return errorMessage ? { isValid: false, errorMessage } : { isValid: true };
    };
}

interface TypoClusterModelMethods {
    getFD: () => { lhs: number[], rhs: number };
}

@Table(getTableOptions("TypoCluster"))
export class TypoClusterConfig extends BaseSpecificTaskConfig implements TypoClusterModelMethods {
    @Column({ type: STRING, allowNull: false })
    typoFD!: string;

    @ForeignKey(() => TypoFDTaskConfig)
    @IsUUID(4)
    @Column({ type: UUID, allowNull: false })
    typoTaskID!: string;

    getFD = () => {
        const indices = this.typoFD.split(",").map((id) => Number(id));
        return { lhs: indices.slice(0, indices.length - 1 ), rhs: indices[indices.length - 1] };
    };

    static isPropsValid: IsPropsValidFunctionType = async (props) => {
        const { typoTaskID, typoFD: FD } = props;
        let errorMessage: string | undefined;

        if (typeof typoTaskID !== "string") {
            errorMessage = `Received incorrect typoTaskId '${typoTaskID}'`;
        } else if (FD == undefined || FD.length == 0) {
            errorMessage = `Received incorrect FD '${FD}'`;
        } else {
            const mainTaskResult = await TypoFDTaskResult.findByPk(typoTaskID, { attributes: ["TypoFDs"] });
            if (mainTaskResult == null) {
                errorMessage = "Not found main task (TypoFDTask)";
            } else {
                const { TypoFDs } = mainTaskResult;
                if (typeof TypoFDs !== "string") {
                    throw new ApolloError("Main task wasn't processed yet");
                }
                if (!TypoFDs.split(";").includes(FD.join(","))) {
                    errorMessage = `You choose FD ${FD}, which not found in TypoFDs = ${TypoFDs}`;
                }
            }
        }
        return errorMessage ? { isValid: false, errorMessage } : { isValid: true };
    };
}

@Table(getTableOptions("SpecificTypoCluster"))
export class SpecificTypoClusterConfig extends BaseSpecificTaskConfig {
    @ForeignKey(() => TypoClusterConfig)
    @IsUUID(4)
    @Column({ type: UUID, allowNull: false })
    typoClusterTaskID!: string;

    @Column({ type: INTEGER, allowNull: false })
    clusterID!: number;

    static isPropsValid: IsPropsValidFunctionType = async (props) => {
        const { typoClusterTaskID, clusterID } = props;

        let errorMessage: string | undefined;
        if (clusterID == null) {
            errorMessage = "cluster id wasn't provided";
        } else if (typoClusterTaskID == null) {
            errorMessage = "typoClusterTaskID wasn't provided";
        } else {
            const parentTask = await TypoClusterResult.findByPk(typoClusterTaskID, { attributes: ["clustersCount"] });
            if (!parentTask) {
                errorMessage = "Parent task not found";
            } else {
                if (!parentTask.clustersCount) {
                    throw new ApolloError("Clusters count not found");
                }
                if (clusterID >= parentTask.clustersCount || clusterID < 0) {
                    errorMessage = `Cluster ID ${clusterID} must be less, than count of clusters ${parentTask.clustersCount}`;
                }
            }
        }
        return errorMessage ? { isValid: false, errorMessage } : { isValid: true };
    };
}
