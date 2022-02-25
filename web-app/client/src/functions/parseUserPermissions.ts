import { userPermissions } from "../types/types";

export default function parseUserPermissions(
  permissions: string[]
): userPermissions {
  return {
    canUseBuiltinDatasets: permissions.includes("USE_BUILTIN_DATASETS"),
    canUploadFiles: permissions.includes("USE_OWN_DATASETS"),
    canViewAdminInfo: permissions.includes("VIEW_ADMIN_INFO"),
    canManageUserSessions: permissions.includes("MANAGE_USERS_SESSIONS"),
    canChooseTask: false,
  };
}
