import { Column, Model, Table } from "sequelize-typescript";
import { DATE, STRING, UUID, UUIDV4 } from "sequelize";

@Table({
    tableName: "Sessions",
    deletedAt: false,
    createdAt: true,
    updatedAt: true,
})
export class Session extends Model {
    @Column({ type: UUID, primaryKey: true, defaultValue: UUIDV4 })
    sessionID!: string;

    @Column({ type: DATE, allowNull: false })
    expiringDate!: Date;

    @Column({ type: STRING, allowNull: false })
    status!: string;
}
