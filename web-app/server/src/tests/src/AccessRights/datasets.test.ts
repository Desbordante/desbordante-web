import { testQuery } from "../../util";
import { datasets, datasetsVariables } from "../Resolvers/queries/__generated__/datasets";
import { createTestUser } from "../../../db/initTestData";

let invalidToken: string;
let validToken: string;

describe("test access rights for datasets query", () => {

    beforeAll(async () => {
        await createTestUser("USER").then(_ => invalidToken = _.token);
        await createTestUser("ADMIN").then(_ => validToken = _.token);
    });

    it("using datasets without permission", async () => {

        const result = await testQuery<datasets, datasetsVariables>({
            dirname: __dirname,
            queryName: "datasets",
            variables: {
                props: {
                    includeBuiltInDatasets: true,
                    includeDeletedDatasets: false,
                    pagination: {
                        offset: 0,
                        limit: 10,
                    },
                },
                filter: {},
            },
            headers: {
                authorization: "Bearer " + invalidToken,
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
                    pagination: {
                        offset: 0,
                        limit: 10,
                    },
                },
                filter: {},
            },
            headers: {
                authorization: "Bearer " + validToken,
            },
        });

        expect(result.errors).toBeFalsy();
        expect(result.data.datasets).toBeTruthy();
    });
});