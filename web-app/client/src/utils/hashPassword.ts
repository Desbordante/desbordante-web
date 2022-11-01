import { SHA256 } from "crypto-js";
import { passwordSaltPostfix, passwordSaltPrefix } from "./env";

export default function hashPassword(password: string) {
  const saltPrefix = passwordSaltPrefix || "";
  const saltPostfix = passwordSaltPostfix || "";
  return SHA256(saltPrefix + SHA256(password) + saltPostfix).toString();
}
