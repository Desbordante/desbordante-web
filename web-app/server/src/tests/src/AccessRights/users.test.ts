import { testQuery, toAuthorizationHeader } from "../../util";
import { users, usersVariables } from "./queries/__generated__/users";
import { createTestUser } from "../../../db/initTestData";
import { basePagination } from "../../headers";

let userToken: string;
let adminToken: string;

describe("test access rights for users query", () => {

    beforeAll(async () => {
        await createTestUser("USER").then(({ token }) => userToken = token);
        await createTestUser("ADMIN").then(({ token }) => adminToken = token);
    });

    it("using users without permission", async () => {

        const result = await testQuery<users, usersVariables>({
            dirname: __dirname,
            queryName: "users",
            variables: {
                ...basePagination,
            },
            headers: {
                authorization: toAuthorizationHeader(userToken),
            },
        });

        expect(result.errors).toBeTruthy();
        expect(result.data).toBeFalsy();
    });

    it("using users with permission", async () => {

        const result = await testQuery<users, usersVariables>({
            dirname: __dirname,
            queryName: "users",
            variables: {
                ...basePagination,
            },
            headers: {
                authorization: toAuthorizationHeader(adminToken),
            },
        });

        expect(result.errors).toBeFalsy();
        expect(result.data.users).toBeTruthy();
    });
});