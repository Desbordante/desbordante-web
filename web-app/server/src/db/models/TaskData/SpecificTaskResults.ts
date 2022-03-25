import { TEXT, UUID } from "sequelize";
import { BelongsTo, Column, ForeignKey, IsUUID, Model, Table } from "sequelize-typescript";
import { TaskInfo } from "./TaskInfo";
import { PrimitiveType } from "./TaskConfig";

const getResultTableName = (primitive: PrimitiveType) => `${primitive}TasksResult` as const;

@Table({
    tableName: getResultTableName("FD"),
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
    tableName: getResultTableName("CFD"),
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
    tableName: getResultTableName("TypoFD"),
    paranoid: true,
    updatedAt: false,
})
export class TypoFDTaskResult extends Model{
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState!: TaskInfo;

    @Column({ type: TEXT, allowNull: true })
    TypoFDs!: string | null;
}

@Table({
    tableName: getResultTableName("TypoCluster"),
    paranoid: true,
    updatedAt: false,
})
export class TypoClusterResult extends Model{
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState!: TaskInfo;

    @Column({ type: TEXT, allowNull: true })
    TypoClusters!: string | null;

    @Column({ type: TEXT, allowNull: true })
    suspiciousIndices!: string | null;

    @Column({ type: TEXT, allowNull: true })
    clustersCount!: number | null;
}

@Table({
    tableName: getResultTableName("SpecificTypoCluster"),
    paranoid: true,
    updatedAt: false,
})
export class SpecificTypoClusterResult extends Model{
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState!: TaskInfo;

    @Column({ type: TEXT, allowNull: true })
    suspiciousIndices!: string | null;

    @Column({ type: TEXT, allowNull: true })
    squashedNotSortedCluster!: string | null;

    @Column({ type: TEXT, allowNull: true })
    squashedSortedCluster!: string | null;

    @Column({ type: TEXT, allowNull: true })
    notSquashedNotSortedCluster!: string | null;

    @Column({ type: TEXT, allowNull: true })
    notSquashedSortedCluster!: string | null;
}
