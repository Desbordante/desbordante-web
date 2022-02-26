import { ApolloError } from "apollo-server-errors";

export class AccessTokenExpiredError extends ApolloError {
    constructor(message: string) {
        super(message, "TOKEN_EXPIRED");

        Object.defineProperty(this, "name", { value: "AccessTokenExpiredError" });
    }
}
