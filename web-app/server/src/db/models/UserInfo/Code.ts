import { randomInt } from "crypto";
import { DATE, INTEGER, STRING, TEXT, UUID, UUIDV4 } from "sequelize";
import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { Device } from "./Device";
import { User } from "./User";

const ALL_CODES = ["EMAIL_VERIFICATION"] as const;
export type CodeType = typeof ALL_CODES[number];

@Table({
    tableName: "Codes",
    timestamps: false,
    paranoid: true,
})
export class Code extends Model {
    @Column({ type: UUID, primaryKey: true, defaultValue: UUIDV4 })
    codeID!: string;

    @Column({ type: STRING, allowNull: false })
    type!: CodeType;

    @Column({ type: INTEGER, allowNull: false })
    value!: number;

    @Column({ type: DATE, allowNull: false })
    expiringDate!: Date;

    @ForeignKey(() => User)
    @Column({ type: UUID, allowNull: false })
    userID!: string;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Device)
    @Column({ type: TEXT, allowNull: true })
    deviceID!: string | null;

    @BelongsTo(() => Device)
    device!: Device;

    static createCode = async (props: { userID: string, expiringDate: Date, type: CodeType, deviceID: string | null }) => {
        return await Code.create({ ...props, value: randomInt(1000,9999) });
    };

    static createEmailVerificationCode = async (userID: string, deviceID: string) => {
        const expiringDate = new Date(new Date().toUTCString());
        expiringDate.setDate(expiringDate.getDate() + 1);

        return await Code.createCode({ userID, expiringDate, type: "EMAIL_VERIFICATION", deviceID });
    };
}
