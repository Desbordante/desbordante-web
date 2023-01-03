import { testQuery, toAuthorizationHeader } from "../../util";
import {
    createMainTask,
    createMainTaskVariables,
} from "./queries/__generated__/createMainTaskWithDatasetChoosing";
import { createTestUser } from "../../../db/initTestData";
import { getDatasetForPrimitive } from "../Resolvers/utils";

let accessToken: string;
let fileID: string;

describe("test props validation for AR", () => {

    beforeAll(async () => {
        await createTestUser("ADMIN").then(_ => accessToken = _.token);
        fileID = await getDatasetForPrimitive("AR", accessToken, "rules-kaggle-rows-2.csv");
    });

    it("create AR task with all the right parameters", async () => {

        const result = await testQuery<createMainTask, createMainTaskVariables>({
            dirname: __dirname,
            queryName: "createMainTaskWithDatasetChoosing",
            variables: {
                "props": {
                    "algorithmName": "Apriori",
                    "type": "AR",
                    "maxLHS": -1,
                    "minConfidence": 0.1,
                    "minSupportAR": 0.1,
                },
                "fileID": fileID,
                "forceCreate": true,
            },
            headers: {
                authorization: toAuthorizationHeader(accessToken),
            },
        });

        expect(result.data.createMainTaskWithDatasetChoosing).toBeTruthy();
        expect(result.errors).toBeFalsy();
    });

    it("create AR task with wrong algorithm name", async () => {

        const result = await testQuery<createMainTask, createMainTaskVariables>({
            dirname: __dirname,
            queryName: "createMainTaskWithDatasetChoosing",
            variables: {
                "props": {
                    "algorithmName": "something wrong",
                    "type": "AR",
                    "maxLHS": -1,
                    "minConfidence": 0.1,
                    "minSupportAR": 0.1,
                },
                "fileID": fileID,
                "forceCreate": true,
            },
            headers: {
                authorization: toAuthorizationHeader(accessToken),
            },
        });

        expect(result.errors).toBeTruthy();
        expect(result.data).toBeFalsy();
    });

    it("create AR task with wrong min confidence", async () => {

        const result = await testQuery<createMainTask, createMainTaskVariables>({
            dirname: __dirname,
            queryName: "createMainTaskWithDatasetChoosing",
            variables: {
                "props": {
                    "algorithmName": "Apriori",
                    "type": "AR",
                    "maxLHS": -1,
                    "minConfidence": 2,
                    "minSupportAR": 0.1,
                },
                "fileID": fileID,
                "forceCreate": true,
            },
            headers: {
                authorization: toAuthorizationHeader(accessToken),
            },
        });

        expect(result.errors).toBeTruthy();
        expect(result.data).toBeFalsy();
    });

    it("create AR task with wrong min support", async () => {

        const result = await testQuery<createMainTask, createMainTaskVariables>({
            dirname: __dirname,
            queryName: "createMainTaskWithDatasetChoosing",
            variables: {
                "props": {
                    "algorithmName": "Apriori",
                    "type": "AR",
                    "maxLHS": -1,
                    "minConfidence": 0.1,
                    "minSupportAR": 2,
                },
                "fileID": fileID,
                "forceCreate": true,
            },
            headers: {
                authorization: toAuthorizationHeader(accessToken),
            },
        });

        expect(result.errors).toBeTruthy();
        expect(result.data).toBeFalsy();
    });
});