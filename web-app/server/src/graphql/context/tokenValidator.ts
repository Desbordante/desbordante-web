import { AccessTokenExpiredError, InvalidHeaderError } from "../types/errorTypes";
import jwt, { VerifyOptions } from "jsonwebtoken";
import { AccessTokenInstance } from "../../db/models/UserData/Session";
import { IncomingHttpHeaders } from "http";

export const getTokenPayloadIfValid = (headers: IncomingHttpHeaders, secret: string) => {
    if (headers && headers.authorization) {
        const parts = headers.authorization.split(" ");
        if (parts.length !== 2) {
            throw new InvalidHeaderError("Invalid authorization header");
        }
        const [scheme, accessToken] = parts;
        if (scheme !== "Bearer") {
            throw new InvalidHeaderError("Invalid authorization header");
        }
        const options: VerifyOptions = {
            algorithms: ["HS256"],
        };
        try {
            const decoded = jwt.verify(accessToken, secret, options);
            return decoded as AccessTokenInstance;
        } catch (err) {
            console.log(err);
            throw new AccessTokenExpiredError("Token expired or has invalid signature");
        }
    }
    return null;
};

export default getTokenPayloadIfValid;
