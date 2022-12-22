import { testQuery } from "../../util";
import { createMainTaskWithDatasetChoosing, createMainTaskWithDatasetChoosingVariables } from "./queries/__generated__/createMainTaskWithDatasetChoosing";
import { getFilteredDeps, waitWileTaskFinishes } from "./util";
import { getDatasetForPrimitive } from "../Resolvers/utils";
import { Fd } from "../../__generated__/types";
import { createTestUser } from "../../../db/initTestData";

let accessToken: string;
let fileID: string;
let taskID: string;

jest.setTimeout(10000);

describe("test filters on FD task", () => {

    beforeAll(async () => {
        await createTestUser("ADMIN").then(_ => accessToken = _.token);
        fileID = await getDatasetForPrimitive("FD", accessToken, "TestLong.csv");
    });


    it("create FD task", async () => {

       const result = await testQuery<createMainTaskWithDatasetChoosing, createMainTaskWithDatasetChoosingVariables>({
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

       expect(result).toBeTruthy();
       expect(result.data).toBeTruthy();
       expect(result.data.createMainTaskWithDatasetChoosing).toBeTruthy();
       expect(result.data.createMainTaskWithDatasetChoosing.taskID).toBeTruthy();
       expect(result.data.createMainTaskWithDatasetChoosing.isExecuted).toBeDefined();
       expect(result.data.createMainTaskWithDatasetChoosing.processStatus).toBeTruthy();

       taskID = result.data.createMainTaskWithDatasetChoosing.taskID;
       await waitWileTaskFinishes(taskID);
    });

    it("test orderBY parameter", async () => {

        const depsASC = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: -1,
            },
            FDSortBy: "LHS_COL_ID",
        });

        const depsDESC = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "DESC",
            pagination: {
                offset: 0,
                limit: -1,
            },
            FDSortBy: "LHS_COL_ID",
        });

        expect(depsASC).toStrictEqual(depsDESC.reverse());
    });

    it("test filter string \"First\"", async () => {

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "First",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            FDSortBy: "LHS_NAME",
        });

        expect(result.every(_ => {
            return _.lhs.some(_ => {
                return _.name === "First";
                }) || _.rhs.name === "First";
        })).toBeTruthy();
    });

    it("test mustContainLhs filter", async () => {

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            FDSortBy: "LHS_NAME",
            mustContainLhsColIndices: [0],
        });

        expect(result.every(_ => {
            return _.lhs.every(_ => {
                return _.index === 0;
                });
        })).toBeTruthy();
    });

    it("test mustContainRhs filter", async () => { // this doesn't work

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            FDSortBy: "RHS_NAME",
            mustContainRhsColIndices: [0],
        });

        expect(result.every(_ => {
            return _.rhs.index === 0;
        })).toBeTruthy();
    });

    it("test FDSortBy LHS_COL_ID", async () => { //TODO: fix this

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            FDSortBy: "LHS_COL_ID",
            mustContainLhsColIndices: [0],
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                return _1.lhs[0].index - _2.lhs[0].index;
            })
        );
    });

    it("test FDSortBy RHS_COL_ID", async () => {

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: -1,
            },
            FDSortBy: "RHS_COL_ID",
            mustContainLhsColIndices: [0],
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                return _1.rhs.index - _2.rhs.index;
            })
        );
    });

    it("test FDSortBy LHS_NAME", async () => {

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            FDSortBy: "LHS_NAME",
            mustContainLhsColIndices: [0],
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                if (_1.lhs[0].name < _2.lhs[0].name) {
                    return -1;
                } else if (_1.lhs[0].name > _2.lhs[0].name) {
                    return 1;
                } else {
                    return 0;
                }
            })
        );
    });

    it("test FDSortBy RHS_NAME", async () => {

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            FDSortBy: "RHS_NAME",
            mustContainLhsColIndices: [0],
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                if (_1.rhs.name < _2.rhs.name) {
                    return -1;
                } else if (_1.rhs.name > _2.rhs.name) {
                    return 1;
                } else {
                    return 0;
                }
            })
        );
    });
});