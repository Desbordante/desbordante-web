export enum UserEnum {
    USER, ADMIN
}

export type UserNameType = keyof typeof RoleEnum;

export enum RoleEnum {
    ANONYMOUS, USER, SUPPORT, ADMIN, DEVELOPER
}

export type RoleNameType = keyof typeof RoleEnum;

export enum PermissionEnum{
    USE_BUILTIN_DATASETS, USE_OWN_DATASETS, USE_USERS_DATASETS,
    VIEW_ADMIN_INFO,
    MANAGE_USERS_SESSIONS, MANAGE_APP_CONFIG
}
export type PermissionNameType = keyof typeof PermissionEnum;

export const rolesPermissions = [
    { type: UserEnum.USER, roleName: RoleEnum.ANONYMOUS,
        permissions: [PermissionEnum.USE_BUILTIN_DATASETS] },
    { type: UserEnum.USER, roleName: RoleEnum.USER,
        permissions: [PermissionEnum.USE_BUILTIN_DATASETS, PermissionEnum.USE_OWN_DATASETS] },
    { type: UserEnum.ADMIN, roleName: RoleEnum.SUPPORT,
        permissions: [
            PermissionEnum.USE_BUILTIN_DATASETS, PermissionEnum.USE_OWN_DATASETS,
            PermissionEnum.VIEW_ADMIN_INFO,
        ] },
    { type: UserEnum.ADMIN, roleName: RoleEnum.ADMIN,
        permissions: [
            PermissionEnum.USE_BUILTIN_DATASETS, PermissionEnum.USE_OWN_DATASETS,
            PermissionEnum.VIEW_ADMIN_INFO,
            PermissionEnum.MANAGE_USERS_SESSIONS, PermissionEnum.MANAGE_APP_CONFIG,
        ] },
    { type: UserEnum.ADMIN, roleName: RoleEnum.DEVELOPER,
        permissions: [
            PermissionEnum.USE_BUILTIN_DATASETS, PermissionEnum.USE_OWN_DATASETS, PermissionEnum.USE_USERS_DATASETS,
            PermissionEnum.VIEW_ADMIN_INFO,
            PermissionEnum.MANAGE_USERS_SESSIONS, PermissionEnum.MANAGE_APP_CONFIG,
        ] },
];

