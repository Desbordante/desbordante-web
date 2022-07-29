import { SHA256 } from "crypto-js";

export default function hashPassword(password: string) {
  const saltPrefix = process.env.REACT_APP_PASSWORD_SALT_PREFIX || "";
  const saltPostfix = process.env.REACT_APP_PASSWORD_SALT_POSTFIX || "";
  return SHA256(saltPrefix + SHA256(password) + saltPostfix).toString();
}
