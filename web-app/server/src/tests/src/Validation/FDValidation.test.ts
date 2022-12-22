import { createTestUser } from "../../../db/initTestData";
import { getDatasetForPrimitive } from "../Resolvers/utils";
import { testQuery } from "../../util";
import { createMainTaskWithDatasetChoosing } from "../Filters/queries/__generated__/createMainTaskWithDatasetChoosing";
import { createMainTask, createMainTaskVariables } from "./queries/__generated__/createMainTaskWithDatasetChoosing";

let accessToken: string;
let fileID: string;

jest.setTimeout(10000);

describe("test filters on FD task", () => {

    beforeAll(async () => {
        await createTestUser("ADMIN").then(_ => accessToken = _.token);
        fileID = await getDatasetForPrimitive("FD", accessToken, "TestLong.csv");
    });

    it("create FD task with all the right parameters", async () => {

        const result = await testQuery<createMainTask, createMainTaskVariables>({
            dirname: __dirname,
            queryName: "createMainTaskWithDatasetChoosing",
            variables: {
                props: {
                    algorithmName: "Pyro",
                    type: "FD",
                    errorThreshold: 0.5,
                    maxLHS: -1,
                    threadsCount: 1,
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

    it("create FD task with wrong algorithm name", async () => {

        const result = await testQuery<createMainTask, createMainTaskVariables>({
            dirname: __dirname,
            queryName: "createMainTaskWithDatasetChoosing",
            variables: {
                props: {
                    algorithmName: "something wrong",
                    type: "FD",
                    errorThreshold: 0.5,
                    maxLHS: -1,
                    threadsCount: 1,
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

    it("create FD task with wrong error threshold", async () => {

        const result = await testQuery<createMainTask, createMainTaskVariables>({
            dirname: __dirname,
            queryName: "createMainTaskWithDatasetChoosing",
            variables: {
                props: {
                    algorithmName: "Pyro",
                    type: "FD",
                    errorThreshold: 2,
                    maxLHS: -1,
                    threadsCount: 1,
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

    it("create FD task with wrong threads count", async () => {

        const result = await testQuery<createMainTask, createMainTaskVariables>({
            dirname: __dirname,
            queryName: "createMainTaskWithDatasetChoosing",
            variables: {
                props: {
                    algorithmName: "something wrong",
                    type: "FD",
                    errorThreshold: 0.5,
                    maxLHS: -1,
                    threadsCount: 10,
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
