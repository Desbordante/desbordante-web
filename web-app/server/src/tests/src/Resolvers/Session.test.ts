import { testQuery } from "../../util";
import { sessions, sessionsVariables } from "./queries/__generated__/sessions";
import { createTestUser } from "../../../db/initTestData";

let accessToken: string;

describe("test resolver for Session",() => {

    beforeAll(async () => {
        await createTestUser("ADMIN").then(_ => accessToken = _.token);
    });

    it("session", async () => {

        const result = await testQuery<sessions, sessionsVariables>({
            dirname: __dirname,
            queryName: "sessions",
            variables: {
                "pagination": {
                    "offset": 0,
                    "limit": 1,
                },
                "onlyValid": true,
            },
            headers: {
                authorization: "Bearer " + accessToken,
            },
        });

        expect(result).toBeTruthy();
        expect(result.data).toBeTruthy();
        expect(result.errors).toBeFalsy();
        expect(result.data.sessions).toBeDefined();
        expect(result.data.sessions[0]).toBeTruthy();

        if (result.data.sessions[0]) {
            const sessions = result.data.sessions[0];
            expect(sessions.sessionID).toBeDefined();
            expect(sessions.userID).toBeDefined();
            expect(sessions.user).toBeDefined();
            expect(sessions.deviceID).toBeDefined();
            expect(sessions.status).toBeDefined();
            expect(sessions.accessTokenIat).toBeDefined();
        }
    });
});
