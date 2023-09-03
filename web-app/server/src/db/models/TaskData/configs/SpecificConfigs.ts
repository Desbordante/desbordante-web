import { BOOLEAN, FLOAT, INTEGER, REAL, STRING, UUID } from "sequelize";
import { Column, ForeignKey, IsUUID, Table } from "sequelize-typescript";
import { ApolloError } from "apollo-server-core";
import { BaseSpecificTaskConfig } from "./BaseSpecificTaskConfig";
import { GeneralTaskConfig } from "./GeneralTaskConfig";
import { TaskState } from "../TaskState";
import { getConfigTableOptions } from "../tableOptions";

@Table(getConfigTableOptions("FD"))
export class FDTaskConfig extends BaseSpecificTaskConfig {
    @Column({ type: REAL, allowNull: false })
    errorThreshold!: number;

    @Column({ type: INTEGER, allowNull: false })
    maxLHS!: number;

    @Column({ type: INTEGER, allowNull: false })
    threadsCount!: number;
}

const CFD_SUBSTRATEGIES = ["DFS", "BFS"] as const;
type CFDSubstrategyType = typeof CFD_SUBSTRATEGIES[number];

@Table(getConfigTableOptions("CFD"))
export class CFDTaskConfig extends BaseSpecificTaskConfig {
    @Column({ type: INTEGER, allowNull: false })
    maxLHS!: number;

    @Column({ type: INTEGER, allowNull: false })
    minSupportCFD!: number;

    @Column({ type: REAL, allowNull: false })
    minConfidence!: number;

    @Column({ type: STRING, allowNull: false, defaultValue: "DFS" })
    substrategy!: CFDSubstrategyType;
}

@Table(getConfigTableOptions("AR"))
export class ARTaskConfig extends BaseSpecificTaskConfig {
    @Column({ type: REAL, allowNull: false })
    minSupportAR!: number;

    @Column({ type: REAL, allowNull: false })
    minConfidence!: number;
}

const FD_METRICS = ["LEVENSHTEIN", "MODULUS_OF_DIFFERENCE"] as const;
type FDMetricType = typeof FD_METRICS[number];

@Table(getConfigTableOptions("TypoFD"))
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
    metric!: FDMetricType;

    @Column({ type: FLOAT, allowNull: false })
    defaultRadius!: number;

    @Column({ type: FLOAT, allowNull: false })
    defaultRatio!: number;
}

interface TypoClusterModelMethods {
    getFD: () => { lhs: number[]; rhs: number };
}

@Table(getConfigTableOptions("TypoCluster"))
export class TypoClusterTaskConfig
    extends BaseSpecificTaskConfig
    implements TypoClusterModelMethods {
    @Column({ type: STRING, allowNull: false })
    typoFD!: string;

    @ForeignKey(() => TypoFDTaskConfig)
    @IsUUID(4)
    @Column({ type: UUID, allowNull: false })
    parentTaskID!: string;

    @Column({ type: FLOAT, allowNull: false })
    radius!: number;

    @Column({ type: FLOAT, allowNull: false })
    ratio!: number;

    getFD = () => {
        const indices = this.typoFD.split(",").map(Number);
        return {
            lhs: indices.slice(0, indices.length - 1),
            rhs: indices[indices.length - 1],
        };
    };
}

interface SpecificTypoCluster {
    getParentTaskState: () => Promise<TaskState>;
    getParentGeneralTaskConfig: () => Promise<GeneralTaskConfig>;
    getParentSpecificTaskConfig: () => Promise<TypoClusterTaskConfig>;
}

@Table(getConfigTableOptions("SpecificTypoCluster"))
export class SpecificTypoClusterTaskConfig
    extends BaseSpecificTaskConfig
    implements SpecificTypoCluster {
    @ForeignKey(() => TypoClusterTaskConfig)
    @IsUUID(4)
    @Column({ type: UUID, allowNull: false })
    parentTaskID!: string;

    @Column({ type: INTEGER, allowNull: false })
    clusterID!: number;

    public getParentTaskState = async () => {
        const state = await TaskState.findByPk(this.parentTaskID);
        if (!state) {
            throw new ApolloError("Parent task not found");
        }
        return state;
    };

    public getParentGeneralTaskConfig = async () => {
        const config = await GeneralTaskConfig.findByPk(this.parentTaskID);
        if (!config) {
            throw new ApolloError("Parent task config not found");
        }
        return config;
    };

    public getParentSpecificTaskConfig = async () => {
        const specificConfig = await TypoClusterTaskConfig.findByPk(this.parentTaskID);
        if (!specificConfig) {
            throw new ApolloError("Parent specific config not found");
        }
        return specificConfig;
    };
}

@Table(getConfigTableOptions("Stats"))
export class StatsTaskConfig extends BaseSpecificTaskConfig {
    @Column({ type: INTEGER, allowNull: false })
    threadsCount!: number;
}

const MFD_METRICS = ["EUCLIDEAN", "LEVENSHTEIN", "MODULUS_OF_DIFFERENCE"] as const;
type MFDMetricType = typeof MFD_METRICS[number];

const MFD_METRIC_ALGORITHMS = ["BRUTE", "APPROX", "CALIPERS"] as const;
type MFDMetricAlgorithmsType = typeof MFD_METRIC_ALGORITHMS[number];

@Table(getConfigTableOptions("MFD"))
export class MFDTaskConfig extends BaseSpecificTaskConfig {
    @Column({ type: REAL, allowNull: false })
    parameter!: number;

    @Column({
        type: STRING,
        allowNull: false,
        set(this: MFDTaskConfig, value: number[]) {
            this.setDataValue("lhsIndices", value.join(", "));
        },
    })
    lhsIndices!: number[];

    @Column({
        type: STRING,
        allowNull: false,
        set(this: MFDTaskConfig, value: number[]) {
            this.setDataValue("rhsIndices", value.join(", "));
        },
    })
    rhsIndices!: number[];

    @Column({ type: BOOLEAN, allowNull: false })
    distanceToNullIsInfinity!: boolean;

    @Column({
        type: STRING,
        allowNull: false,
        set(this: MFDTaskConfig, value: string) {
            this.setDataValue("metric", value.toLowerCase());
        },
    })
    metric!: MFDMetricType;

    @Column({ type: INTEGER, allowNull: false })
    q: number;

    @Column({
        type: STRING,
        set(this: MFDTaskConfig, value: string) {
            this.setDataValue("metricAlgorithm", value.toLowerCase());
        },
    })
    metricAlgorithm!: MFDMetricAlgorithmsType;
}
