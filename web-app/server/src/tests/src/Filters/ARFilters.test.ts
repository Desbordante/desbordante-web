import { testQuery } from "../../util";
import { createMainTaskWithDatasetChoosing, createMainTaskWithDatasetChoosingVariables } from "./queries/__generated__/createMainTaskWithDatasetChoosing";
import { compare, getFilteredDeps, waitWileTaskFinishes } from "./util";
import { getDatasetForPrimitive } from "../Resolvers/utils";
import { AR } from "../TaskProcess/queries/__generated__/GetMainTaskDeps";
import { Ar } from "../../__generated__/types";
import { createTestUser } from "../../../db/initTestData";

let accessToken: string;
let fileID: string;
let taskID: string;

jest.setTimeout(10000);

describe("test filters on AR task", () => {

    beforeAll(async () => {
        await createTestUser("ADMIN").then(_ => accessToken = _.token);
        fileID = await getDatasetForPrimitive("AR", accessToken, "rules-kaggle-rows-2.csv");
    });

    it("create AR task", async () => {

        const result = await testQuery<createMainTaskWithDatasetChoosing, createMainTaskWithDatasetChoosingVariables>({
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
                authorization: "Bearer " + accessToken,
            },
        });

        expect(result).toBeTruthy();
        expect(result.data).toBeTruthy();
        expect(result.data.createMainTaskWithDatasetChoosing).toBeTruthy();
        expect(result.data.createMainTaskWithDatasetChoosing.taskID).toBeTruthy();
        expect(result.data.createMainTaskWithDatasetChoosing.isExecuted).toBeDefined();
        expect(result.data.createMainTaskWithDatasetChoosing.processStatus).toBeTruthy();

        taskID = result.data.createMainTaskWithDatasetChoosing.taskID;
        await waitWileTaskFinishes(taskID, 10);
    });

    it("test orderBY parameter", async () => {

        const depsASC = await getFilteredDeps<Ar>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: -1,
            },
            ARSortBy: "DEFAULT",
        });

        const depsDESC = await getFilteredDeps<Ar>(taskID, {
            filterString: "",
            orderBy: "DESC",
            pagination: {
                offset: 0,
                limit: -1,
            },
            ARSortBy: "DEFAULT",
        });

        expect(depsASC).toStrictEqual(depsDESC.reverse());
    });


    it("test filter string \"BREAD\"", async () => {

        const result = await getFilteredDeps<Ar>(taskID, {
            filterString: "BREAD",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: -1,
            },
            ARSortBy: "DEFAULT",
        });

        expect(result.every(_ => {
            return _.lhs.some(_ => {
                return _ === "BREAD";
            }) || _.rhs.some(_ => {
 return _ === "BREAD";
});
        })).toBeTruthy();
    });

    it("test ARSortBy LHS_NAME", async () => {

        const result = await getFilteredDeps<Ar>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            ARSortBy: "LHS_NAME",
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                for (let i = 0; i < Math.min(_1.lhs.length, _2.lhs.length); ++i) {
                    if (compare(_1.lhs[i], _2.lhs[i]) != 0) {
                        return compare(_1.lhs[i], _2.lhs[i]);
                    }
                }
                return _1.lhs.length - _2.lhs.length;
            })
        );
    });

    it("test ARSortBy RHS_NAME", async () => {

        const result = await getFilteredDeps<Ar>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            ARSortBy: "RHS_NAME",
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                for (let i = 0; i < Math.min(_1.rhs.length, _2.rhs.length); ++i) {
                    if (compare(_1.rhs[i], _2.rhs[i]) != 0) {
                        return compare(_1.rhs[i], _2.rhs[i]);
                    }
                }
                return _1.rhs.length - _2.rhs.length;
            })
        );
    });

    it("test ARSortBy CONF", async () => {

        const result = await getFilteredDeps<Ar>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            ARSortBy: "CONF",
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                return _1.confidence - _2.confidence;
            })
        );
    });
});