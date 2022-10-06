import { BOOLEAN, INTEGER, STRING, UUID } from "sequelize";
import {
    ForeignKey, 
    IsUUID,
    BelongsTo,
    Column,
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
export class FileStats extends Model {
    @Column({ type: INTEGER })
    columnIndex!: number;

    @IsUUID(4)
    @ForeignKey(() => FileInfo)
    @Column({ type: UUID })
    fileID!: string;

    @Column({ type: STRING, allowNull: true })
    columnName: string;

    @Column({ type: INTEGER, allowNull: true })
    distinct!: number;

    @Column({ type: BOOLEAN, allowNull: true })
    isCategorical!: boolean;

    @Column({ type: INTEGER, allowNull: true })
    count!: number;

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
