import { BOOLEAN, INTEGER, STRING, UUID } from "sequelize";
import {
    BelongsTo,
    Column,
    ForeignKey,
    IsUUID,
    Model,
    Table,
} from "sequelize-typescript";
import { FileInfo } from "./FileInfo";

@Table({
    paranoid: true,
    updatedAt: false,
    createdAt: false,
    tableName: "Statistic",
})
export class ColumnStats extends Model {
    @IsUUID(4)
    @ForeignKey(() => FileInfo)
    @Column({ type: UUID, primaryKey: true })
    fileID!: string;

    @Column({ type: INTEGER, primaryKey: true })
    columnIndex!: number;

    @Column({ type: STRING, allowNull: false, defaultValue: "" })
    type!: string;

    @Column({ type: INTEGER, allowNull: true })
    distinct: number;

    @Column({ type: BOOLEAN, allowNull: true })
    isCategorical: boolean;

    @Column({ type: INTEGER, allowNull: true })
    count: number;

    @Column({ type: STRING, allowNull: true })
    avg: string;

    @Column({ type: STRING, allowNull: true })
    STD: string;

    @Column({ type: STRING, allowNull: true })
    skewness: string;

    @Column({ type: STRING, allowNull: true })
    kurtosis: string;

    @Column({ type: STRING, allowNull: true })
    min: string;

    @Column({ type: STRING, allowNull: true })
    max: string;

    @Column({ type: STRING, allowNull: true })
    sum: string;

    @Column({ type: STRING, allowNull: true })
    quantile25: string;

    @Column({ type: STRING, allowNull: true })
    quantile50: string;

    @Column({ type: STRING, allowNull: true })
    quantile75: string;

    @BelongsTo(() => FileInfo)
    fileInfo!: FileInfo;
}
