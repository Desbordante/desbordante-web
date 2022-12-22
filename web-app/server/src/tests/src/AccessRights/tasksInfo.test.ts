import { testQuery } from "../../util";
import { tasksInfo, tasksInfoVariables } from "./queries/__generated__/tasksInfo";
import { createTestUser } from "../../../db/initTestData";

let invalidToken: string;
let validToken: string;

describe("test access rights for tasksInfo query", () => {

    beforeAll(async () => {
        await createTestUser("USER").then(_ => invalidToken = _.token);
        await createTestUser("ADMIN").then(_ => validToken = _.token);
    });

    it("using tasksInfo without permission", async () => {

        const result = await testQuery<tasksInfo, tasksInfoVariables>({
            dirname: __dirname,
            queryName: "tasksInfo",
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
        expect(result.data.tasksInfo).toBeFalsy();
    });

    it("using tasksInfo with permission", async () => {

        const result = await testQuery<tasksInfo, tasksInfoVariables>({
            dirname: __dirname,
            queryName: "tasksInfo",
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
        expect(result.data.tasksInfo).toBeTruthy();
    });
});