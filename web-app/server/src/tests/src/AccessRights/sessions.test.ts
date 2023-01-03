import { testQuery, toAuthorizationHeader } from "../../util";
import { sessions, sessionsVariables } from "./queries/__generated__/sessions";
import { createTestUser } from "../../../db/initTestData";
import { basePagination } from "../../headers";

let userToken: string;
let adminToken: string;

describe("test access rights for sessions query", () => {

    beforeAll(async () => {
        await createTestUser("USER").then(({ token }) => userToken = token);
        await createTestUser("ADMIN").then(({ token }) => adminToken = token);
    });

    it("using sessions without permission", async () => {

        const result = await testQuery<sessions, sessionsVariables>({
            dirname: __dirname,
            queryName: "sessions",
            variables: {
                ...basePagination,
                onlyValid: true,
            },
            headers: {
                authorization: toAuthorizationHeader(userToken),
            },
        });

        expect(result.errors).toBeTruthy();
        expect(result.data).toBeFalsy(); //data is null -? should be data.sessions
    });

    it("using sessions with permission", async () => {

        const result = await testQuery<sessions, sessionsVariables>({
            dirname: __dirname,
            queryName: "sessions",
            variables: {
                ...basePagination,
                onlyValid: true,
            },
            headers: {
                authorization: toAuthorizationHeader(adminToken),
            },
        });

        expect(result.errors).toBeFalsy();
        expect(result.data.sessions).toBeTruthy();
    });
});