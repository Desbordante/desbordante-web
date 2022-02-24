import { UserInputError } from "apollo-server-core";
import { STRING, UUID, UUIDV4 } from "sequelize";
import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { PermissionEnum, RoleEnum, RoleNameType, rolesPermissions } from "./permissionsConfig";
import { User } from "./User";

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
    type!: string;

    @Column({ type: STRING })
    permissionIndices!: string;

    static getAllRoles = () => {
        return Object.values(RoleEnum)
            .filter(key => typeof key !== "number") as RoleNameType[];
    };

    static getPermissionForRole = (role: RoleEnum) => {
        const rolesPermission = rolesPermissions.find(item => role === item.roleName);
        if (!rolesPermission) {
            throw new UserInputError(`Incorrect roleName = ${role} was provided.\n\rAvailable: ${JSON.stringify(Role.getAllRoles())}`);
        }
        return rolesPermission.permissions;
    };

    static getPermissionNamesForRole = (role: RoleEnum) => {
        return Role.getPermissionForRole(role).map(id => PermissionEnum[id]);
    };
}
