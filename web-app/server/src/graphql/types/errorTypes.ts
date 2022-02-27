import { ApolloError } from "apollo-server-errors";

export class AccessTokenExpiredError extends ApolloError {
    constructor(message: string) {
        super(message, "TOKEN_EXPIRED");

        Object.defineProperty(this, "name", { value: "AccessTokenExpiredError" });
    }
}

export class InvalidTokenError extends ApolloError {
    constructor(message: string) {
        super(message, "INVALID_TOKEN");

        Object.defineProperty(this, "name", { value: "InvalidTokenError" });
    }
}

export class InvalidHeaderError extends ApolloError {
    constructor(message: string) {
        super(message, "INVALID_HEADER_ERROR");

        Object.defineProperty(this, "name", { value: "InvalidHeaderError" });
    }
}
