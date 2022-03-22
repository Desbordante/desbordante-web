import { TEXT, UUID } from "sequelize";
import { BelongsTo, Column, ForeignKey, IsUUID, Model, Table } from "sequelize-typescript";
import { TaskInfo } from "./TaskInfo";

@Table({
    tableName: "FDTasksResult",
    paranoid: true,
    updatedAt: false,
})
export class FDTaskResult extends Model{
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState!: TaskInfo;

    @Column({ type: TEXT, allowNull: true })
    PKColumnIndices!: string | null;

    @Column({ type: TEXT, allowNull: true })
    FDs!: string | null;

    @Column({ type: TEXT, allowNull: true })
    pieChartData!: string | null;
}

@Table({
    tableName: "CFDTasksResult",
    paranoid: true,
    updatedAt: false,
})
export class CFDTaskResult extends Model{
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState!: TaskInfo;

    @Column({ type: TEXT, allowNull: true })
    PKColumnIndices!: string | null;

    @Column({ type: TEXT, allowNull: true })
    CFDs!: string | null;

    @Column({ type: TEXT, allowNull: true })
    withPatterns!: string | null;

    @Column({ type: TEXT, allowNull: true })
    withoutPatterns!: string | null;
}

@Table({
    tableName: "ARTasksResult",
    paranoid: true,
    updatedAt: false,
})
export class ARTaskResult extends Model{
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState!: TaskInfo;

    @Column({ type: TEXT, allowNull: true })
    ARs!: string | null;

    @Column({ type: TEXT, allowNull: true })
    valueDictionary!: string | null;
}

@Table({
    tableName: "TypoTasksResult",
    paranoid: true,
    updatedAt: false,
})
export class TypoTaskResult extends Model{
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState!: TaskInfo;

    @Column({ type: TEXT, allowNull: true })
    approxFDs!: string | null;
}
