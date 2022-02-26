import { BelongsTo, Column, ForeignKey, IsUUID, Model, Table } from "sequelize-typescript";
import { INTEGER, STRING, TEXT, UUID, UUIDV4 } from "sequelize";
import { User } from "./User";

// TODO: add paranoid (bug)
@Table({
    deletedAt: false,
    createdAt: true,
    updatedAt: false,
    tableName: "Feedbacks",
})
export class Feedback extends Model {
    @IsUUID(4)
    @Column({ type: UUID, primaryKey: true, defaultValue: UUIDV4 })
    feedbackID!: string;

    @ForeignKey(() => User)
    @Column({ type: UUID, allowNull: true })
    userID!: string;

    @BelongsTo(() => User)
    user!: User;

    @Column({ type: INTEGER, allowNull: false })
    rating!: number;

    @Column({ type: STRING, allowNull: true })
    subject?: string;

    @Column({ type: TEXT, allowNull: false })
    text!: string;
}
