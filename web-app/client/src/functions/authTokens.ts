import cookie from "cookie";
import { TokenPair } from "../types/types";

export function getAccessToken(): string | undefined {
  return cookie.parse(document.cookie).accessToken;
}

export function setAccessToken(token: string, lifetime = 15 * 60) {
  document.cookie = cookie.serialize("accessToken", token, {
    maxAge: lifetime,
  });
}

export function getRefreshToken(): string | undefined {
  return cookie.parse(document.cookie).requestToken;
}

export function setRefreshToken(token: string, lifetime = 15 * 24 * 60 * 60) {
  document.cookie = cookie.serialize("refreshToken", token, {
    maxAge: lifetime,
  });
}

export function saveTokenPair(tokenPair: TokenPair) {
  setAccessToken(tokenPair.accessToken);
  setRefreshToken(tokenPair.refreshToken);
}

export function removeTokenPair() {
  setAccessToken("", -1);
  setRefreshToken("", -1);
}
