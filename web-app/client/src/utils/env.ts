export const port = process.env.PORT;
export const cmsApiToken = process.env.CMS_API_TOKEN;
export const isGoogleAnalyticsEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ENABLED === 'true';
export const googleAnalyticsTagId =
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_TAG_ID;
export const passwordSaltPrefix = process.env.NEXT_PUBLIC_PASSWORD_SALT_PREFIX;
export const passwordSaltPostfix =
  process.env.NEXT_PUBLIC_PASSWORD_SALT_POSTFIX;
