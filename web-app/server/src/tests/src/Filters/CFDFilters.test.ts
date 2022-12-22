import { testQuery } from "../../util";
import { createMainTaskWithDatasetChoosing, createMainTaskWithDatasetChoosingVariables } from "./queries/__generated__/createMainTaskWithDatasetChoosing";
import { compare, getFilteredDeps, waitWileTaskFinishes } from "./util";
import { getDatasetForPrimitive } from "../Resolvers/utils";
import { Cfd } from "../../__generated__/types";
import { createTestUser } from "../../../db/initTestData";

let accessToken: string;
let fileID: string;
let taskID: string;

jest.setTimeout(10000);

describe("test filters on СFD task", () => {

    beforeAll(async () => {
        await createTestUser("ADMIN").then(_ => accessToken = _.token);
        fileID = await getDatasetForPrimitive("CFD",  accessToken, "TestLong.csv");
    });


    it("create CFD task", async () => {

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

        const depsASC = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: -1,
            },
            CFDSortBy: "DEFAULT",
        });

        const depsDESC = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "DESC",
            pagination: {
                offset: 0,
                limit: -1,
            },
            CFDSortBy: "DEFAULT",
        });

        expect(depsASC).toStrictEqual(depsDESC.reverse());
    });


    it("test filter string \"First\"", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "First",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: -1,
            },
            CFDSortBy: "DEFAULT",
        });

        expect(result.every(_ => {
            return _.lhs.some(_ => {
                return _.column.name === "First";
                }) || _.rhs.column.name === "First";
        })).toBeTruthy();
    });

    it("test filter string \"First=_\"", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "First=_",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            CFDSortBy: "DEFAULT",
        });

        expect(result.every(_ => {
            return (_.lhs.some(_ => {
                return _.column.name === "First";
            }) || _.rhs.column.name === "First") && (_.lhs.some(_ => {
                return _.pattern === "_";
            }) || _.rhs.pattern === "_");
        })).toBeTruthy();
    });


    it("test mustContainLhs filter", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            CFDSortBy: "DEFAULT",
            mustContainLhsColIndices: [0],
        });

        expect(result.every(_ => {
            return _.lhs.some(_ => {
                return _.column.index === 0;
            });
        })).toBeTruthy();
    });

    it("test mustContainRhs filter", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            CFDSortBy: "DEFAULT",
            mustContainRhsColIndices: [0],
        });

        expect(result.every(_ => {
            return _.rhs.column.index === 0;
        })).toBeTruthy();
    });

    it("test СFDSortBy LHS_COL_ID", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            CFDSortBy: "LHS_COL_ID",
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                for (let i = 0; i < Math.min(_1.lhs.length, _2.lhs.length); ++i) {
                    if (_1.lhs[i].column.index - _2.lhs[i].column.index != 0) {
                        return _1.lhs[i].column.index - _2.lhs[i].column.index;
                    }
                }
                return _1.lhs.length - _2.lhs.length;
            })
        );
    });

    it("test СFDSortBy RHS_COL_ID", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            CFDSortBy: "RHS_COL_ID",
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                return _1.rhs.column.index - _2.rhs.column.index;
            })
        );
    });

    it("test СFDSortBy LHS_NAME", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            CFDSortBy: "LHS_COL_NAME",
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                for (let i = 0; i < Math.min(_1.lhs.length, _2.lhs.length); ++i) {
                    if (compare(_1.lhs[i].column.name, _2.lhs[i].column.name) != 0) {
                        return _1.lhs[i].column.index - _2.lhs[i].column.index;
                    }
                }
                return _1.lhs.length - _2.lhs.length;
            })
        );
    });

    it("test CFDSortBy RHS_NAME", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            CFDSortBy: "RHS_COL_NAME",
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                return compare(_1.rhs.column.name, _2.rhs.column.name);
            })
        );
    });

    it("test СFDSortBy CONF", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            CFDSortBy: "CONF",
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                return _1.confidence - _2.confidence;
            })
        );
    });

    it("test CFDSortBy SUP", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            CFDSortBy: "SUP",
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                return _1.support - _2.support;
            })
        );
    });

    it("test СFDSortBy LHS_PATTERN", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            CFDSortBy: "LHS_PATTERN",
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                for (let i = 0; i < Math.min(_1.lhs.length, _2.lhs.length); ++i) {
                    if (compare(_1.lhs[i].pattern, _2.lhs[i].pattern) != 0) {
                        return compare(_1.lhs[i].pattern, _2.lhs[i].pattern);
                    }
                }
                return _1.lhs.length - _2.lhs.length;
            })
        );
    });

    it("test CFDSortBy RHS_PATTERN", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: 10,
            },
            CFDSortBy: "RHS_PATTERN",
        });

        expect(result).toStrictEqual(
            [...result].sort((_1, _2): number => {
                return compare(_1.rhs.pattern, _2.rhs.pattern);
            })
        );
    });
});