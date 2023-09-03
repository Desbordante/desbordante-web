import { BOOLEAN, INTEGER, TEXT, UUID } from "sequelize";
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

class SpecificTaskWithDepsResult extends Model {
    @IsUUID(4)
    @ForeignKey(() => TaskState)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskState)
    taskState!: TaskState;

    @Column({ type: TEXT, allowNull: true })
    deps!: string | null;

    @Column({ type: INTEGER, allowNull: true })
    depsAmount!: number | null;
}

@Table(getResultTableOptions("FD"))
export class FDTaskResult extends SpecificTaskWithDepsResult {
    @Column({ type: TEXT, allowNull: true })
    PKColumnIndices!: string | null;

    @Column({ type: TEXT, allowNull: true })
    withoutPatterns!: string | null;
}

@Table(getResultTableOptions("CFD"))
export class CFDTaskResult extends SpecificTaskWithDepsResult {
    @Column({ type: TEXT, allowNull: true })
    withoutPatterns!: string | null;
}

@Table(getResultTableOptions("AR"))
export class ARTaskResult extends SpecificTaskWithDepsResult {
    @Column({ type: TEXT, allowNull: true })
    valueDictionary!: string | null;
}

@Table(getResultTableOptions("TypoFD"))
export class TypoFDTaskResult extends SpecificTaskWithDepsResult {
    @Column({ type: TEXT, allowNull: true })
    PKColumnIndices!: string | null;
}

@Table(getResultTableOptions("MFD"))
export class MFDTaskResult extends SpecificTaskWithDepsResult {
    @Column({ type: BOOLEAN, allowNull: true })
    result!: boolean | null;
}
