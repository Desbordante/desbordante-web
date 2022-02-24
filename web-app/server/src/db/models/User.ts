import { randomInt } from "crypto";
import {
    AllowNull, BelongsTo, Column, ForeignKey,
    HasMany, IsEmail, IsUUID, Model, Table,
} from "sequelize-typescript";
import { DATE, INTEGER, STRING, TEXT, UUID, UUIDV4 } from "sequelize";
import { Device } from "./Device";
import { Feedback } from "./Feedback";
import { FileInfo } from "./FileInfo";
import { PermissionEnum, PermissionNameType, RoleEnum } from "./permissionsConfig";
import { Role } from "./Role";
import { Session } from "./Session";
import { TaskInfo } from "./TaskInfo";

interface UserModelMethods {
    getPermissionNames: () => Promise<string[]>;
    getPermissionIndices: () => Promise<PermissionEnum[]>;
    addRole: (role: RoleEnum) => Promise<Role>;
    addRoles: (roles: RoleEnum[]) => Promise<Role[]>;
    createSession: (deviceID: string) => Promise<Session>;
}

@Table({
    tableName: "Users",
    updatedAt: false,
    paranoid: true,
})
export class User extends Model implements UserModelMethods {

    @IsUUID(4)
    @Column({ type: UUID, primaryKey: true, defaultValue: UUIDV4 })
    userID!: string;

    @HasMany(() => Session)
    sessions?: [Session];

    @HasMany(() => Feedback)
    feedbacks?: [Feedback];

    @HasMany(() => TaskInfo)
    tasks?: [TaskInfo];

    @HasMany(() => FileInfo)
    files?: [FileInfo];

    @HasMany(() => Role)
    roles?: [Role];

    @Column({ type: STRING, allowNull: false })
    firstName!: string;

    @Column({ type: STRING, allowNull: false })
    lastName!: string;

    @IsEmail
    @Column({ type: STRING, allowNull: false })
    email!: string;

    @Column({ type: STRING, allowNull: false })
    country!: string;

    @Column({ type: STRING, allowNull: false })
    companyOrAffiliation!: string;

    @Column({ type: STRING, allowNull: false })
    occupation!: string;

    @Column({ type: STRING, allowNull: false })
    pwdHash!: string;

    @AllowNull(false)
    @Column(STRING)
    accountStatus!: string;

    getPermissionNames = async () => {
        return await this.getPermissionIndices()
            .then(indices => indices.map(id => PermissionEnum[id]));
    };

    getPermissionIndices = async () => {
        const roles: Role[] | null = await this.$get("roles");
        if (!roles) {
            return [] as number[];
        }
        return roles
            .map(role => JSON.parse(role.permissionIndices) as number[])
            .reduce((prevIndices, indices) =>
                Array.from(new Set([...prevIndices, ...indices])));
    };

    addRole = async (roleValue: RoleEnum) => {
        const permissionIndices = JSON.stringify(Role.getPermissionForRole(roleValue));
        return await this.$create("role",
            { type: roleValue, permissionIndices }) as Role;
    };

    addRoles = async (roles: RoleEnum[]): Promise<Role[]> => {
        return Promise.all(roles.map(roleValue => this.addRole(roleValue)));
    };

    createSession = async (deviceID: string) => {
        const session = await Session.create({
            userID: this.userID,
            status: "VALID",
            deviceID,
        });
        return session;
    };
}

@Table({
    tableName: "Codes",
    timestamps: false,
    paranoid: true,
})
export class Code extends Model {
    @Column({ type: UUID, primaryKey: true, defaultValue: UUIDV4 })
    codeID!: string;

    @Column({ type: STRING, allowNull: false })
    type!: string;

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
    @Column({ type: TEXT, allowNull: false })
    deviceID!: string;

    @BelongsTo(() => Device)
    device!: Device;

    static createEmailVerificationCode = async (userID: string, deviceID: string) => {
        const expiringDate = new Date(new Date().toUTCString());
        expiringDate.setDate(expiringDate.getDate() + 1);

        return await Code.create({
            userID,
            expiringDate,
            type: "EMAIL VERIFICATION",
            value: randomInt(1000, 9999),
            deviceID,
        });
    };
}



@Table({ tableName: "Permissions", timestamps: false })
export class Permission extends Model {
    @Column({ type: INTEGER, primaryKey: true })
    id!: number;

    @Column({ type: STRING, allowNull: false })
    permission!: string;

    static getPermissionNames = () => {
        return Object.values(PermissionEnum)
            .filter(key => typeof key !== "number" ) as PermissionNameType[];
    };

    static initPermissionsTable = async () => {
        const permissionWithIndices = Permission.getPermissionNames()
            .map(name => ({ id: PermissionEnum[name], permission: name }));

        for (const item of permissionWithIndices) {
            await Permission.create(item);
        }
    };

}
