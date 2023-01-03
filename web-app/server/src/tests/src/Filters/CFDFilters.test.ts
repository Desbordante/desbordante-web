import { cleanUp, createTestData, getFilteredDeps } from "./util";
import { Cfd } from "../../__generated__/types";
import { basePagination } from "../../headers";

let taskID: string;
let fileID: string;

jest.setTimeout(10000);

describe("test filters on СFD task", () => {

    beforeAll(async () => {
        await createTestData("CFD", "0.7:2=1:2=1:2;0.5:1=0:0=1:1;0.8:0=2,1=3:1=3:3", "CTane").then(({ taskUUID, fileUUID }) => {
            taskID = taskUUID;
            fileID = fileUUID;
        });
    });

    afterAll(async () => {
        await cleanUp("CFD", taskID, fileID);
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

        expect(depsASC).toBeTruthy();
        expect(depsDESC).toBeTruthy();
        expect(depsASC).toStrictEqual(depsDESC.reverse());
    });

    it("test filter string \"A\"", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "A",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: -1,
            },
            CFDSortBy: "DEFAULT",
        });

        expect(result.map(({ lhs, rhs }) =>
            [...lhs, rhs]).every((items) => items.some((item) => item.column.name === "A"))
        ).toBeTruthy();
    });

    it("test filter string \"A=_\"", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "A=_",
            orderBy: "ASC",
            ...basePagination,
            CFDSortBy: "DEFAULT",
        });

        expect(result).toBeTruthy();
        expect(result.map(({ lhs, rhs }) =>
            [...lhs, rhs]).every((items) => items.some((item) => item.column.name === "A" && item.pattern === "_"))
        ).toBeTruthy();
    });

    it("test mustContainLhs filter", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            CFDSortBy: "DEFAULT",
            mustContainLhsColIndices: [0],
        });

        expect(result.every((items) => {
            return items.lhs.some((item) => {
                return item.column.index === 0;
            });
        })).toBeTruthy();
    });

    it("test mustContainRhs filter", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            CFDSortBy: "DEFAULT",
            mustContainRhsColIndices: [0],
        });

        expect(result.every((item) => {
            return item.rhs.column.index === 0;
        })).toBeTruthy();
    });

    it("test СFDSortBy LHS_COL_ID", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            CFDSortBy: "LHS_COL_ID",
        });

        expect(result.map((items) => items.lhs.map((item) => item.column.index))).toStrictEqual([[0, 1], [1], [2]]);
    });

    it("test СFDSortBy RHS_COL_ID", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            CFDSortBy: "RHS_COL_ID",
        });

        expect(result.map((items) => items.rhs.column.index)).toStrictEqual([0, 1, 2]);
    });

    it("test СFDSortBy LHS_NAME", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            CFDSortBy: "LHS_COL_NAME",
        });

        expect(result.map((items) => items.lhs.map((item) => item.column.name))).toStrictEqual([["A", "B"], ["B"], ["C"]]);
    });

    it("test CFDSortBy RHS_NAME", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            CFDSortBy: "RHS_COL_NAME",
        });

        expect(result.map((items) => items.rhs.column.name)).toStrictEqual(["A", "B", "C"]);
    });

    it("test СFDSortBy CONF", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            CFDSortBy: "CONF",
        });

        expect(result.map((item) => item.confidence)).toStrictEqual([0.5, 0.7, 0.8]);
    });

    it("test CFDSortBy SUP", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            CFDSortBy: "SUP",
        });

        expect(result.map((item) => item.support)).toStrictEqual([1, 2, 3]);
    });

    it("test СFDSortBy LHS_PATTERN", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            CFDSortBy: "LHS_PATTERN",
        });

        expect(result.map((items) => items.lhs.map((item) => item.pattern))).toStrictEqual([["_"], ["1"], ["2", "3"]]
        );
    });

    it("test CFDSortBy RHS_PATTERN", async () => {

        const result = await getFilteredDeps<Cfd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            CFDSortBy: "RHS_PATTERN",
        });

        expect(result.map((item) => item.rhs.pattern)).toStrictEqual(["1", "1", "3"]);
    });
});