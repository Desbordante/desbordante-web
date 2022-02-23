import { inRange } from "lodash";
import { AllowNull, BelongsTo, Column, ForeignKey, IsUUID, Model, Table } from "sequelize-typescript";
import { INTEGER, REAL, UUID } from "sequelize";
import { allowedCFDAlgorithms, allowedFDAlgorithms } from "../../graphql/schema/AppConfiguration/resolvers";
import { IntersectionTaskProps } from "../../graphql/types/types";
import { TaskInfo } from "./TaskInfo";

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
    @Column({ type: REAL })
    minSupport!: number;

    @AllowNull(false)
    @Column({ type: REAL })
    minConfidence!: number;

    static isPropsValid = (props: IntersectionTaskProps) => {
        const { algorithmName, maxLHS, minConfidence, minSupport } = props;
        if (!~allowedCFDAlgorithms.findIndex(({ name }) => algorithmName === name)) {
            return false;
        }
        if (typeof minConfidence !== "number" || minConfidence < 0 || minConfidence > 1) {
            return false;
        }
        if (typeof maxLHS !== "number" || maxLHS < -1) {
            return false;
        }
        return !(typeof minSupport !== "number" || minSupport < 1);
    };
}
