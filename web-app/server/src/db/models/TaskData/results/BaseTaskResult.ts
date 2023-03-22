import { BelongsTo, Column, ForeignKey, IsUUID, Model } from "sequelize-typescript";
import { TaskState } from "../TaskState";
import { UUID } from "sequelize";

export class BaseSpecificTaskResult extends Model {
    @IsUUID(4)
    @ForeignKey(() => TaskState)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskState)
    taskState!: TaskState;
}
