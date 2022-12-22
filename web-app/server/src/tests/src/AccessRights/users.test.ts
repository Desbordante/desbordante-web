import { testQuery } from "../../util";
import { users, usersVariables } from "./queries/__generated__/users";
import { createTestUser } from "../../../db/initTestData";

let invalidToken: string;
let validToken: string;

describe("test access rights for users query", () => {

    beforeAll(async () => {
        await createTestUser("USER").then(_ => invalidToken = _.token);
        await createTestUser("ADMIN").then(_ => validToken = _.token);
    });

    it("using users without permission", async () => {

        const result = await testQuery<users, usersVariables>({
            dirname: __dirname,
            queryName: "users",
            variables: {
                pagination: {
                    offset: 0,
                    limit: 10,
                },
            },
            headers: {
                authorization: "Bearer " + invalidToken,
            },
        });

        expect(result.errors).toBeTruthy();
        expect(result.data).toBeFalsy(); // data is null - no users?
    });

    it("using users with permission", async () => {

        const result = await testQuery<users, usersVariables>({
            dirname: __dirname,
            queryName: "users",
            variables: {
                pagination: {
                    offset: 0,
                    limit: 10,
                },
            },
            headers: {
                authorization: "Bearer " + validToken,
            },
        });

        expect(result.errors).toBeFalsy();
        expect(result.data.users).toBeTruthy();
    });
});