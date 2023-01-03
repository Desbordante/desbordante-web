import { testQuery, toAuthorizationHeader } from "../../util";
import { datasets, datasetsVariables } from "../Resolvers/queries/__generated__/datasets";
import { createTestUser } from "../../../db/initTestData";
import { basePagination } from "../../headers";

let userToken: string;
let adminToken: string;

describe("test access rights for datasets query", () => {

    beforeAll(async () => {
        await createTestUser("USER").then(({ token }) => userToken = token);
        await createTestUser("ADMIN").then(({ token }) => adminToken = token);
    });

    it("using datasets without permission", async () => {

        const result = await testQuery<datasets, datasetsVariables>({
            dirname: __dirname,
            queryName: "datasets",
            variables: {
                props: {
                    includeBuiltInDatasets: true,
                    includeDeletedDatasets: false,
                    ...basePagination,
                },
                filter: {},
            },
            headers: {
                authorization: toAuthorizationHeader(userToken),
            },
        });

        expect(result.errors).toBeTruthy();
        expect(result.data.datasets).toBeFalsy();
    });

    it("using datasets without permission", async () => {

        const result = await testQuery<datasets, datasetsVariables>({
            dirname: __dirname,
            queryName: "datasets",
            variables: {
                props: {
                    includeBuiltInDatasets: true,
                    includeDeletedDatasets: false,
                    ...basePagination,
                },
                filter: {},
            },
            headers: {
                authorization: "Bearer " + adminToken,
            },
        });

        expect(result.errors).toBeFalsy();
        expect(result.data.datasets).toBeTruthy();
    });
});