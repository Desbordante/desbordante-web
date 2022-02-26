import {
    Column, HasMany, IsEmail, IsUUID, Model, Table,
} from "sequelize-typescript";
import { Role, RoleType } from "./Role";
import { STRING, UUID, UUIDV4 } from "sequelize";
import { Session, SessionStatusType } from "./Session";
import { Feedback } from "./Feedback";
import { FileInfo } from "./FileInfo";
import { Permission } from "./Permission";
import { TaskInfo } from "../TaskData/TaskInfo";

const ALL_ACCOUNT_STATUS = ["EMAIL VERIFICATION", "EMAIL VERIFIED"] as const;
export type AccountStatusType = typeof ALL_ACCOUNT_STATUS[number];

interface UserModelMethods {
    getPermissions: () => Promise<string[]>;
    getPermissionIndices: () => Promise<number[]>;
    addRole: (role: RoleType) => Promise<Role>;
    addRoles: (roles: RoleType[]) => Promise<Role[]>;
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
    fullName!: string;

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

    @Column({ type: STRING, allowNull: false })
    accountStatus!: AccountStatusType;

    getPermissions = async () => {
        return await this.getPermissionIndices()
            .then(indices => indices.map(id => Permission.getAllPermissions()[id]));
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

    addRole = async (role: RoleType) => {
        const roles = await this.$get("roles") as Role[];
        const roleIdx = roles.findIndex(({ type }) => type === role);
        if (~roleIdx) {
            return roles[roleIdx];
        }
        const permissionIndices = JSON.stringify(Role.getPermissionsForRole(role));
        return await this.$create("role",
            { type: role, permissionIndices }) as Role;
    };

    addRoles = async (roles: RoleType[]): Promise<Role[]> => {
        return Promise.all(roles.map(roleValue => this.addRole(roleValue)));
    };

    createSession = async (deviceID: string) => {
        const status: SessionStatusType = "VALID";
        return await Session.create({ userID: this.userID, status, deviceID });
    };
}
