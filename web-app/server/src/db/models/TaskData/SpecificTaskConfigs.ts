import { AllowNull, BelongsTo, Column, ForeignKey, IsUUID, Model, Table } from "sequelize-typescript";
import { INTEGER, REAL, UUID } from "sequelize";
import {
    allowedARAlgorithms,
    allowedCFDAlgorithms,
    allowedFDAlgorithms, allowedTypoMinerAlgorithm, maxThreadsCount,
} from "../../../graphql/schema/AppConfiguration/resolvers";
import { IntersectionTaskProps } from "../../../graphql/types/types";
import { TaskInfo } from "./TaskInfo";

export type IsPropsValidFunctionType = (props: IntersectionTaskProps) =>
    { isValid: true } | { errorMessage: string, isValid: false };

@Table({
    tableName: "FDTasksConfig",
    updatedAt: false,
    paranoid: true,
})
export class FDTaskConfig extends Model{
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState!: TaskInfo;

    @AllowNull(false)
    @Column({ type: REAL })
    errorThreshold!: number;

    @AllowNull(false)
    @Column({ type: INTEGER })
    maxLHS!: number;

    @AllowNull(false)
    @Column({ type: INTEGER })
    threadsCount!: number;

    static isPropsValid: IsPropsValidFunctionType = props => {
        const { algorithmName, errorThreshold, maxLHS, threadsCount } = props;
        let errorMessage: string | undefined;
        if (!~allowedFDAlgorithms.findIndex(({ name }) => algorithmName === name)) {
            errorMessage = `Algorithm name ${algorithmName} not found`;
        } else if (typeof errorThreshold !== "number" || errorThreshold < 0 || errorThreshold > 1) {
            errorMessage = `Error threshold isn't valid ${errorThreshold}`;
        } else if (typeof maxLHS !== "number" || maxLHS < -1) {
            errorMessage = `maxLHS ${maxLHS} isn't valid`;
        } else if (typeof threadsCount !== "number" || threadsCount < 1 || threadsCount > maxThreadsCount) {
            errorMessage = `threadsCount ${threadsCount} isn't valid (min = 1, max = ${maxThreadsCount})`;
        }
        return errorMessage? { isValid: false, errorMessage } : { isValid: true };
    };
}

@Table({
    tableName : "CFDTasksConfig",
    updatedAt: false,
    paranoid: true,
})
export class CFDTaskConfig extends Model{
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState!: TaskInfo;

    @AllowNull(false)
    @Column({ type: INTEGER })
    maxLHS!: number;

    @AllowNull(false)
    @Column({ type: INTEGER })
    minSupportCFD!: number;

    @AllowNull(false)
    @Column({ type: REAL })
    minConfidence!: number;

    static isPropsValid : IsPropsValidFunctionType = props => {
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

@Table({
    tableName : "ARTasksConfig",
    updatedAt: false,
    paranoid: true,
})
export class ARTaskConfig extends Model{
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState!: TaskInfo;

    @AllowNull(false)
    @Column({ type: REAL })
    minSupportAR!: number;

    @AllowNull(false)
    @Column({ type: REAL })
    minConfidence!: number;

    static isPropsValid: IsPropsValidFunctionType = props => {
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

@Table({
    tableName : "TypoTasksConfig",
    updatedAt: false,
    paranoid: true,
})
export class TypoTaskConfig extends Model{
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState!: TaskInfo;

    @AllowNull(false)
    @Column({ type: REAL })
    errorThreshold!: number;

    @AllowNull(false)
    @Column({ type: INTEGER })
    maxLHS!: number;

    @AllowNull(false)
    @Column({ type: INTEGER })
    threadsCount!: number;

    static isPropsValid: IsPropsValidFunctionType = props => {
        const { algorithmName, preciseAlgorithm, approximateAlgorithm,
            metric, radius, ratio } = props;
        let errorMessage: string | undefined;
        if (algorithmName !== allowedTypoMinerAlgorithm.name) {
            errorMessage = `Received incorrect algorithm name ${algorithmName}`
                + `, expected: ${allowedTypoMinerAlgorithm.name}`;
        } else if (approximateAlgorithm != "TaneX") {
            errorMessage = `Received incorrect approximate algorithm name ${approximateAlgorithm}`
                + `, expected: ${allowedTypoMinerAlgorithm.name}`;
        } else if (!preciseAlgorithm) {
            errorMessage = `Received incorrect approximate algorithm name ${preciseAlgorithm}`;
        } else if (metric === undefined) {
            errorMessage = "Received undefined metric";
        } else if (typeof radius !== "number" || radius < 0) {
            errorMessage = `Received incorrect radius ${radius}`;
        } else if (typeof ratio !== "number" || ratio < 0 || ratio > 1) {
            errorMessage = `Received incorrect ratio ${ratio} (min = 0, max = 1)`;
        } else {
            props.algorithmName = preciseAlgorithm;
            const isFdAlgoValid = FDTaskConfig.isPropsValid(props);
            if (!isFdAlgoValid.isValid) {
                return isFdAlgoValid;
            }
        }

        return errorMessage ? { isValid: false, errorMessage } : { isValid: true };
    };
}
