import cookie from 'cookie';
import { TokenPair } from 'types/auth';

export function getAccessToken(): string | undefined {
  return cookie.parse(document.cookie).accessToken;
}

export function setAccessToken(token: string) {
  document.cookie = cookie.serialize('accessToken', token, { path: '/' });
}

export function getRefreshToken(): string | undefined {
  return cookie.parse(document.cookie).refreshToken;
}

export function setRefreshToken(token: string) {
  document.cookie = cookie.serialize('refreshToken', token, { path: '/' });
}

export function saveTokenPair(tokenPair: TokenPair) {
  setAccessToken(tokenPair.accessToken);
  setRefreshToken(tokenPair.refreshToken);
}

export function removeTokenPair() {
  setAccessToken('');
  setRefreshToken('');
}

export function removeUser() {
  localStorage.removeItem('user');
}
