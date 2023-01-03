import { testQuery, toAuthorizationHeader } from "../../util";
import { datasets, datasetsVariables } from "./queries/__generated__/datasets";
import { createTestUser } from "../../../db/initTestData";

let accessToken: string;

describe("test resolver for datasetInfo",() => {

    beforeAll(async () => {
        await createTestUser("ADMIN").then(_ => accessToken = _.token);
    });

    it("dataset info", async () => {

        const result = await testQuery<datasets, datasetsVariables>(
            {
                dirname: __dirname,
                queryName: "datasets",
                variables: {
                    props: {
                        includeBuiltInDatasets: true,
                        includeDeletedDatasets: false,
                        pagination: {
                            offset: 0,
                            limit: 1,
                        },
                    },
                    filter: {},
                },
                headers: {
                    authorization: toAuthorizationHeader(accessToken),
                },
            });

        expect(result.data).toBeTruthy();
        expect(result.errors).toBeFalsy();
        expect(result.data.datasets).toBeDefined();
    });
});
