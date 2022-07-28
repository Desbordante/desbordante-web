export const environment = process.env.NODE_ENV || 'development';
export const googleAnalyticsKey =
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || 'G-R5TT9Z3Y7Q';
export const serverIP =
  process.env.NEXT_PUBLIC_HOST_SERVER_IP || 'desbordante.unidata-platform.ru';
export const serverProtocol =
  process.env.NEXT_PUBLIC_SERVER_PROTOCOL || 'https';
export const serverPort = process.env.NEXT_PUBLIC_SERVER_PORT || '80';
export const passwordSaltPrefix =
  process.env.NEXT_PUBLIC_PASSWORD_SALT_PREFIX || '';
export const passwordSaltPostfix =
  process.env.NEXT_PUBLIC_PASSWORD_SALT_POSTFIX || '';
