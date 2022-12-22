import { createTestUser } from "../../../db/initTestData";
import { getDatasetForPrimitive } from "../Resolvers/utils";
import { testQuery } from "../../util";
import { createMainTaskWithDatasetChoosing, createMainTaskWithDatasetChoosingVariables } from "../Filters/queries/__generated__/createMainTaskWithDatasetChoosing";

let accessToken: string;
let fileID: string;

jest.setTimeout(10000);

describe("test filters on CFD task", () => {

    beforeAll(async () => {
        await createTestUser("ADMIN").then(_ => accessToken = _.token);
        fileID = await getDatasetForPrimitive("CFD", accessToken, "TestLong.csv");
    });


    it("create CFD task with all the right parameters", async () => {

        const result = await testQuery<createMainTaskWithDatasetChoosing, createMainTaskWithDatasetChoosingVariables>({
            dirname: __dirname,
            queryName: "createMainTaskWithDatasetChoosing",
            variables: {
                props: {
                    algorithmName: "CTane",
                    type: "CFD",
                    maxLHS: -1,
                    minSupportCFD: 1,
                    minConfidence: 0.5,
                },
                fileID: fileID,
                forceCreate: true,
            },
            headers: {
                authorization: "Bearer " + accessToken,
            },
        });

        expect(result.data.createMainTaskWithDatasetChoosing).toBeTruthy();
        expect(result.errors).toBeFalsy();
    });

    it("create CFD task with the wrong algorithm name", async () => {

        const result = await testQuery<createMainTaskWithDatasetChoosing, createMainTaskWithDatasetChoosingVariables>({
            dirname: __dirname,
            queryName: "createMainTaskWithDatasetChoosing",
            variables: {
                props: {
                    algorithmName: "something wrong",
                    type: "CFD",
                    maxLHS: -1,
                    minSupportCFD: 1,
                    minConfidence: 0.5,
                },
                fileID: fileID,
                forceCreate: true,
            },
            headers: {
                authorization: "Bearer " + accessToken,
            },
        });

        expect(result.data).toBeFalsy();
        expect(result.errors).toBeTruthy();
    });

    it("create CFD task with the wrong min support", async () => {

        const result = await testQuery<createMainTaskWithDatasetChoosing, createMainTaskWithDatasetChoosingVariables>({
            dirname: __dirname,
            queryName: "createMainTaskWithDatasetChoosing",
            variables: {
                props: {
                    algorithmName: "CTane",
                    type: "CFD",
                    maxLHS: -1,
                    minSupportCFD: 0,
                    minConfidence: 0.5,
                },
                fileID: fileID,
                forceCreate: true,
            },
            headers: {
                authorization: "Bearer " + accessToken,
            },
        });

        expect(result.data).toBeFalsy();
        expect(result.errors).toBeTruthy();
    });
});
