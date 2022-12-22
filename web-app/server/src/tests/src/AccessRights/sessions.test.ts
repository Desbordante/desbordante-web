import { testQuery } from "../../util";
import { sessions, sessionsVariables } from "./queries/__generated__/sessions";
import { createTestUser } from "../../../db/initTestData";

let invalidToken: string;
let validToken: string;

describe("test access rights for sessions query", () => {

    beforeAll(async () => {
        await createTestUser("USER").then(_ => invalidToken = _.token);
        await createTestUser("ADMIN").then(_ => validToken = _.token);
    });

    it("using sessions without permission", async () => {

        const result = await testQuery<sessions, sessionsVariables>({
            dirname: __dirname,
            queryName: "sessions",
            variables: {
                pagination: {
                    offset: 0,
                    limit: 10,
                },
                onlyValid: true,
            },
            headers: {
                authorization: "Bearer " + invalidToken,
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
                pagination: {
                    offset: 0,
                    limit: 10,
                },
                onlyValid: true,
            },
            headers: {
                authorization: "Bearer " + validToken,
            },
        });

        expect(result.errors).toBeFalsy();
        expect(result.data.sessions).toBeTruthy();
    });
});