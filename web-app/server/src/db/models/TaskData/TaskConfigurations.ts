import { AllowNull, BelongsTo, Column, ForeignKey, HasOne, IsUUID, Model, Table } from "sequelize-typescript";
import { INTEGER, REAL, UUID } from "sequelize";
import {
    allowedARAlgorithms,
    allowedCFDAlgorithms,
    allowedFDAlgorithms,
} from "../../../graphql/schema/AppConfiguration/resolvers";
import { IntersectionTaskProps } from "../../../graphql/types/types";
import { TaskInfo } from "./TaskInfo";
import { FileFormat } from "../Authorization/FileFormat";
import { User } from "../Authorization/User";

@Table({
    tableName: "FDTasksConfig",
    updatedAt: false,
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

    static isPropsValid = (props: IntersectionTaskProps) => {
        const { algorithmName, errorThreshold, maxLHS, threadsCount } = props;
        if (!~allowedFDAlgorithms.findIndex(({ name }) => algorithmName === name)) {
            console.log("Algorithm name not found");
            return false;
        }
        if (typeof errorThreshold !== "number" || errorThreshold < 0 || errorThreshold > 1) {
            console.log("Error threshold isn't valid");
            return false;
        }
        if (typeof maxLHS !== "number" || maxLHS < -1) {
            console.log("maxLHS isn't valid");
            return false;
        }
        const MAX_THREADS_COUNT = 8;
        if (typeof threadsCount !== "number" || threadsCount < 1 || threadsCount > MAX_THREADS_COUNT) {
            console.log("threadsCount isn't valid");
            return false;
        }
        return true;
    };

}

@Table({
    tableName : "CFDTasksConfig",
    updatedAt: false,
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

    static isPropsValid = (props: IntersectionTaskProps) => {
        const { algorithmName, maxLHS, minConfidence, minSupportCFD } = props;
        if (!~allowedCFDAlgorithms.findIndex(({ name }) => algorithmName === name)) {
            return false;
        }
        if (typeof minConfidence !== "number" || minConfidence < 0 || minConfidence > 1) {
            return false;
        }
        if (typeof maxLHS !== "number" || maxLHS < -1) {
            return false;
        }
        return !(typeof minSupportCFD !== "number" || minSupportCFD < 1);
    };
}

@Table({
    tableName : "ARTasksConfig",
    updatedAt: false,
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

    static isPropsValid = (props: IntersectionTaskProps) => {
        const { algorithmName, minConfidence, minSupportAR } = props;
        if (!~allowedARAlgorithms.findIndex(({ name }) => algorithmName === name)) {
            return false;
        }
        if (typeof minConfidence !== "number" || minConfidence < 0 || minConfidence > 1) {
            return false;
        }

        if (typeof minSupportAR !== "number" || minSupportAR > 1 || minSupportAR < 0) {
            return false;
        }
        return true;
    };
}
