export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type SignUpFormProps = {
  fullName: string;
  email: string;
  password: string;
  country: string;
  company: string;
  occupation: string;
};

export type DecodedToken = {
  deviceID: string;
  exp: number;
  iat: number;
  sessionID: string;
  userID: string;
  email: string;
  fullName: string;
  permissions: string[];
  accountStatus: string;
};

export type UserPermissions = {
  canUseBuiltinDatasets: boolean;
  canChooseTask: boolean;
  canUploadFiles: boolean;
  canViewAdminInfo: boolean;
  canManageUserSessions: boolean;
};

export type User = {
  id?: string;
  name?: string;
  email?: string;
  isVerified?: boolean;
  permissions: UserPermissions;
};