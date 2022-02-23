import { setContext } from "@apollo/client/link/context";
import { v4 as uuidv4 } from "uuid";

export const requestIdLink = setContext((operation, previousContext) => {
  const { headers } = previousContext;
  const deviceID = localStorage.getItem("deviceID") || "";
  const deviceInfo = localStorage.getItem("deviceInfo") || "";
  const userID = localStorage.getItem("userID") || "";
  const randomID = uuidv4();

  const requestId = `${deviceID}:${userID}:${randomID}`;

  return {
    ...previousContext,
    headers: {
      ...headers,
      "X-Request-ID": requestId,
      "X-Device": deviceInfo,
    },
  };
});
