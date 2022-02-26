import { UserPermissions } from "../types/types";

export default function parseUserPermissions(
  permissions: string[] | null
): UserPermissions {
  return {
    canUseBuiltinDatasets:
      !!permissions && permissions.includes("USE_BUILTIN_DATASETS"),
    canUploadFiles: !!permissions && permissions.includes("USE_OWN_DATASETS"),
    canViewAdminInfo: !!permissions && permissions.includes("VIEW_ADMIN_INFO"),
    canManageUserSessions:
      !!permissions && permissions.includes("MANAGE_USERS_SESSIONS"),
    canChooseTask: false,
  };
}
