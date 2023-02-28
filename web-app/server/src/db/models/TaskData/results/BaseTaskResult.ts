import { BOOLEAN, TEXT, UUID } from "sequelize";
import {
    BelongsTo,
    Column,
    ForeignKey,
    IsUUID,
    Model,
    Table,
} from "sequelize-typescript";
import { TaskState } from "../TaskState";
import { getResultTableOptions } from "../tableOptions";

export class BaseSpecificTaskResult extends Model {
    @IsUUID(4)
    @ForeignKey(() => TaskState)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskState)
    taskState!: TaskState;
}

@Table(getResultTableOptions("MFD"))
export class MFDTaskResult extends BaseSpecificTaskResult {
    @Column({ type: BOOLEAN, allowNull: true })
    result!: boolean;

    @Column({ type: TEXT, allowNull: true })
    highlights: string;
}
