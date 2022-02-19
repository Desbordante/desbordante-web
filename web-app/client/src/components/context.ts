import { setContext } from "@apollo/client/link/context";

export const requestIdLink = setContext((operation, previousContext) => {
  const { headers } = previousContext;
  const deviceId = localStorage.getItem("deviceId") || "";
  const userId = localStorage.getItem("userId") || "";
  const sessionId = localStorage.getItem("sessionId") || "";
  const requestId = `${deviceId}:${userId}:${sessionId}`;
  return {
    ...previousContext,
    headers: { ...headers, "x-request-id": requestId },
  };
});
