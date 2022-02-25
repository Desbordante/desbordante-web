import cookie from "cookie";
import { TokenPair } from "../types/types";

export default function saveTokenPair(tokenPair: TokenPair) {
  document.cookie = cookie.serialize("accessToken", tokenPair.accessToken, {
    maxAge: 15 * 60,
  });
  document.cookie = cookie.serialize("refreshToken", tokenPair.refreshToken);
}
