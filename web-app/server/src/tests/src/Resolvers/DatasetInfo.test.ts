import { testQuery } from "../../util";
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
                    authorization: "Bearer " + accessToken,
                },
            });

        expect(result).toBeTruthy();
        expect(result.data).toBeTruthy();
        expect(result.errors).toBeFalsy();
        expect(result.data.datasets).toBeDefined();

        if (result.data.datasets) {
            const dataset = result.data.datasets[0];
            expect(dataset.fileID).toBeDefined();
            expect(dataset.createdAt).toBeDefined();
            expect(dataset.isBuiltIn).toBeDefined();
            expect(dataset.hasHeader).toBeDefined();
            if (dataset.hasHeader) {
                expect(dataset.header).toBeDefined();
            }
            expect(dataset.delimiter).toBeDefined();
            expect(dataset.rowsCount).toBeDefined();
            expect(dataset.snippet).toBeDefined();
            expect(dataset.supportedPrimitives).toBeDefined();
            expect(dataset.tasks).toBeDefined();
            expect(dataset.statsInfo).toBeDefined();
        }
    });
});
