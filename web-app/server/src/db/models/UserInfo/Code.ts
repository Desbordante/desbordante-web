import { randomInt } from "crypto";
import { DATE, INTEGER, STRING, TEXT, UUID, UUIDV4 } from "sequelize";
import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { Device } from "./Device";
import { User } from "./User";
import { UserInputError } from "apollo-server-core";

const ALL_CODES = ["EMAIL_VERIFICATION", "PASSWORD_RECOVERY_PENDING", "PASSWORD_RECOVERY_APPROVED"] as const;
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
        return await Code.create({ ...props, value: randomInt(1000, 9999) });
    };

    static createVerificationCode = async (userID: string, deviceID: string, type: CodeType) => {
        const expiringDate = new Date(new Date().toUTCString());
        if (type === "EMAIL_VERIFICATION") {
            expiringDate.setDate(expiringDate.getDate() + 1);
        } else if (type === "PASSWORD_RECOVERY_PENDING") {
            expiringDate.setMinutes(expiringDate.getMinutes() + 10);
        }
        return await Code.createCode({ userID, expiringDate, type, deviceID });
    };

    static findAndDestroyCodeIfNotValid = async (userID: string, type: CodeType,
                                                 inputDeviceID: string, inputCodeValue: number | undefined = undefined) => {
        const code = await Code.findOne({ where: { userID, type } });
        if (!code) {
            throw new UserInputError("User hasn't email verification codes");
        }
        if (code.deviceID !== inputDeviceID) {
            await code.destroy();
            throw new UserInputError("Request sent from another device, temporary code destroyed");
        }

        if (code.expiringDate < new Date(new Date().toUTCString())) {
            console.log(code.expiringDate, new Date(new Date().toUTCString()));
            await code.destroy();
            throw new UserInputError("Code was expired");
        }
        if (type !== "PASSWORD_RECOVERY_APPROVED" && (inputCodeValue === undefined || code.value !== inputCodeValue)) {
            await code.destroy();
            throw new UserInputError("Received incorrect code value, temporary code was destroyed");
        }
        return code;
    };
}
