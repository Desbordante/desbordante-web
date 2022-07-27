import { Column, Model, Table } from "sequelize-typescript";
import { INTEGER, STRING } from "sequelize";
import { Role } from "./Role";
import { AccessTokenInstance } from "./Session";

const ALL_PERMISSIONS = [
    "USE_BUILTIN_DATASETS", "USE_OWN_DATASETS", "USE_USERS_DATASETS",
    "VIEW_ADMIN_INFO", "MANAGE_USERS_SESSIONS",
    "MANAGE_APP_CONFIG",
] as const;

export type PermissionType = typeof ALL_PERMISSIONS[number];

@Table({ tableName: "Permissions", timestamps: false })
export class Permission extends Model {
    @Column({ type: INTEGER, primaryKey: true })
    id!: number;

    @Column({ type: STRING, allowNull: false })
    permission!: PermissionType;

    static getAllPermissions = () => ALL_PERMISSIONS;

    static initPermissionsTable = async () =>
        Promise.all(
            Permission.getAllPermissions()
                .map(async (permission, id) =>
                    await Permission.findOrCreate({ where: { permission, id } })
                )
        ).then(() => console.debug("Permissions table was initialized"));

    static getPermissionsBySessionInfo = (sessionInfo: AccessTokenInstance | null) =>
        sessionInfo ? sessionInfo.permissions : Role.getPermissionsForRole("ANONYMOUS");
}
