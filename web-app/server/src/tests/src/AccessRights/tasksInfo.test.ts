import { testQuery, toAuthorizationHeader } from "../../util";
import { tasksInfo, tasksInfoVariables } from "./queries/__generated__/tasksInfo";
import { createTestUser } from "../../../db/initTestData";
import { basePagination } from "../../headers";

let userToken: string;
let adminToken: string;

describe("test access rights for tasksInfo query", () => {

    beforeAll(async () => {
        await createTestUser("USER").then(({ token }) => userToken = token);
        await createTestUser("ADMIN").then(({ token }) => adminToken = token);
    });

    it("using tasksInfo without permission", async () => {

        const result = await testQuery<tasksInfo, tasksInfoVariables>({
            dirname: __dirname,
            queryName: "tasksInfo",
            variables: {
                ...basePagination,
            },
            headers: {
                authorization: toAuthorizationHeader(userToken),
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
                ...basePagination,
            },
            headers: {
                authorization: toAuthorizationHeader(adminToken),
            },
        });

        expect(result.errors).toBeFalsy();
        expect(result.data.tasksInfo).toBeTruthy();
    });
});
