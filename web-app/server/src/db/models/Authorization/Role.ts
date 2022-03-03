import { STRING, UUID, UUIDV4 } from "sequelize";
import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";

import { Permission, PermissionType } from "./Permission";
import { User } from "./User";

const ALL_ROLES = ["ANONYMOUS", "USER", "SUPPORT", "ADMIN", "DEVELOPER"] as const;
export type RoleType = typeof ALL_ROLES[number];

type RolePermission = { role: RoleType, permissions: PermissionType[] };

export const rolesPermissions: RolePermission[] = [
    { role: "ANONYMOUS", permissions: ["USE_BUILTIN_DATASETS"] },
    { role: "USER", permissions: ["USE_BUILTIN_DATASETS", "USE_OWN_DATASETS"] },
    { role: "SUPPORT", permissions: [
            "USE_BUILTIN_DATASETS", "USE_OWN_DATASETS",
            "VIEW_ADMIN_INFO",
        ] },
    { role: "ADMIN",
        permissions: [
            "USE_BUILTIN_DATASETS", "USE_OWN_DATASETS",
            "VIEW_ADMIN_INFO",
            "MANAGE_USERS_SESSIONS", "MANAGE_APP_CONFIG",
        ] },
    { role: "DEVELOPER",
        permissions: [
            "USE_BUILTIN_DATASETS", "USE_OWN_DATASETS", "USE_USERS_DATASETS",
            "VIEW_ADMIN_INFO",
            "MANAGE_USERS_SESSIONS", "MANAGE_APP_CONFIG",
        ] },
];

@Table({
    tableName: "Roles",
    timestamps: false,
})
export class Role extends Model {
    @Column({ type: UUID, defaultValue: UUIDV4, primaryKey: true })
    roleID!: string;

    @ForeignKey(() => User)
    @Column({ type: UUID, allowNull: false })
    userID!: string;

    @BelongsTo(()=> User)
    user!: User;

    @Column({ type: STRING, allowNull: false })
    type!: RoleType;

    @Column({ type: STRING })
    permissionIndices!: string;

    static getAllRoles = () => ALL_ROLES;

    static getPermissionsForRole = (role: RoleType) =>
        rolesPermissions.find(item => role === item.role)?.permissions || null;

    static getPermissionIndicesForRole = (role: RoleType) =>
        Role.getPermissionsForRole(role)
            ?.map(permission =>
                Permission.getAllPermissions().indexOf(permission));
}
