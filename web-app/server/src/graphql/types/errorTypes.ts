import { GraphQLError } from "graphql";

export class AccessTokenExpiredError extends GraphQLError {
    constructor(message: string) {
        super(message, { extensions: { code: "TOKEN_EXPIRED" } });

        Object.defineProperty(this, "name", { value: "AccessTokenExpiredError" });
    }
}

export class InvalidTokenError extends GraphQLError {
    constructor(message: string) {
        super(message, { extensions: { code: "INVALID_TOKEN" } });

        Object.defineProperty(this, "name", { value: "InvalidTokenError" });
    }
}

export class InvalidHeaderError extends GraphQLError {
    constructor(message: string) {
        super(message, { extensions: { code: "INVALID_HEADER_ERROR" } });

        Object.defineProperty(this, "name", { value: "InvalidHeaderError" });
    }
}
