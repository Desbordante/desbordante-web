import { TEXT, UUID } from "sequelize";
import { BelongsTo, Column, ForeignKey, IsUUID, Model, Table } from "sequelize-typescript";
import { TaskInfo } from "./TaskInfo";

@Table({
    tableName: "FDTasksResult",
    updatedAt: false,
})
export class FDTaskResult extends Model{
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState!: TaskInfo;

    @Column(TEXT)
    PKColumnIndices?: string;

    @Column(TEXT)
    FDs?: string;

    @Column(TEXT)
    pieChartData?: string;
}

@Table({
    tableName: "CFDTasksResult",
    updatedAt: false,
})
export class CFDTaskResult extends Model{
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState!: TaskInfo;

    @Column(TEXT)
    PKColumnIndices?: string;

    @Column(TEXT)
    CFDs?: string;

    @Column(TEXT)
    pieChartData?: string;
}
