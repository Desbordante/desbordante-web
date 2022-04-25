import { INTEGER, TEXT, UUID } from "sequelize";
import { BelongsTo, Column, ForeignKey, IsUUID, Model, Table } from "sequelize-typescript";
import { TaskState } from "./TaskState";
import { PrimitiveType } from "./TaskConfig";

const getSpecificResultTableName = (primitive: PrimitiveType) => `${primitive}TasksResult` as const;
const getTableOptions = (primitive: PrimitiveType) =>
    ({ tableName: getSpecificResultTableName(primitive), updatedAt: false, paranoid: true } as const);

class BaseSpecificTaskResult extends Model {
    @IsUUID(4)
    @ForeignKey(() => TaskState)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskState)
    taskState!: TaskState;
}

@Table(getTableOptions("FD"))
export class FDTaskResult extends BaseSpecificTaskResult {
    @Column({ type: TEXT, allowNull: true })
    PKColumnIndices!: string | null;

    @Column({ type: TEXT, allowNull: true })
    FDs!: string | null;

    @Column({ type: TEXT, allowNull: true })
    withoutPatterns!: string | null;

    @Column({ type: INTEGER, allowNull: true })
    depsAmount!: number | null;
}

@Table(getTableOptions("CFD"))
export class CFDTaskResult extends BaseSpecificTaskResult {
    @Column({ type: TEXT, allowNull: true })
    PKColumnIndices!: string | null;

    @Column({ type: TEXT, allowNull: true })
    CFDs!: string | null;

    @Column({ type: TEXT, allowNull: true })
    withPatterns!: string | null;

    @Column({ type: TEXT, allowNull: true })
    withoutPatterns!: string | null;

    @Column({ type: INTEGER, allowNull: true })
    depsAmount!: number | null;

    @Column({ type: TEXT, allowNull: true })
    valueDictionary!: string | null;
}

@Table(getTableOptions("AR"))
export class ARTaskResult extends BaseSpecificTaskResult {
    @Column({ type: TEXT, allowNull: true })
    ARs!: string | null;

    @Column({ type: TEXT, allowNull: true })
    valueDictionary!: string | null;

    @Column({ type: INTEGER, allowNull: true })
    depsAmount!: number | null;
}

@Table(getTableOptions("TypoFD"))
export class TypoFDTaskResult extends BaseSpecificTaskResult {
    @Column({ type: TEXT, allowNull: true })
    TypoFDs!: string | null;

    @Column({ type: INTEGER, allowNull: true })
    depsAmount!: number | null;
}

@Table(getTableOptions("TypoCluster"))
export class TypoClusterResult extends BaseSpecificTaskResult {
    @Column({ type: TEXT, allowNull: true })
    TypoClusters!: string | null;

    @Column({ type: TEXT, allowNull: true })
    suspiciousIndices!: string | null;

    @Column({ type: TEXT, allowNull: true })
    clustersCount!: number | null;
}

@Table(getTableOptions("SpecificTypoCluster"))
export class SpecificTypoClusterResult extends BaseSpecificTaskResult {
    @Column({ type: TEXT, allowNull: true })
    suspiciousIndices!: string | null;

    @Column({ type: TEXT, allowNull: true })
    squashedNotSortedCluster!: string | null;

    @Column({ type: TEXT, allowNull: true })
    squashedSortedCluster!: string | null;

    @Column({ type: INTEGER, allowNull: true })
    squashedItemsAmount!: number | null;

    @Column({ type: INTEGER, allowNull: true })
    notSquashedItemsAmount!: number | null;

    @Column({ type: TEXT, allowNull: true })
    notSquashedNotSortedCluster!: string | null;

    @Column({ type: TEXT, allowNull: true })
    notSquashedSortedCluster!: string | null;
}
