import { cleanUp, createTestData, getFilteredDeps } from "./util";
import { Fd } from "../../__generated__/types";
import { basePagination } from "../../headers";

let taskID: string;
let fileID: string;

jest.setTimeout(10000);

describe("test filters on FD task", () => {

    beforeAll(async () => {
        await createTestData("FD", "0,2,1;0,2;2,1", "Pyro").then(({ taskUUID, fileUUID }) => {
             taskID = taskUUID;
             fileID = fileUUID;
        });
    });

    afterAll(async () => {
       await cleanUp("FD", taskID, fileID);
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

        expect(depsASC).toBeTruthy();
        expect(depsDESC).toBeTruthy();
        expect(depsASC).toStrictEqual(depsDESC.reverse());
    });

    it("test filter string \"A\"", async () => {

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "A",
            orderBy: "ASC",
            ...basePagination,
            FDSortBy: "LHS_NAME",
        });

        expect(result.map(({ lhs, rhs }) =>
            [...lhs, rhs]).every((items) => items.some((item) => item.name === "A"))
        ).toBeTruthy();

    });

    it("test mustContainLhs filter", async () => {

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            FDSortBy: "LHS_NAME",
            mustContainLhsColIndices: [0],
        });

        expect(result.every((items) => {
            return items.lhs.some((item) => {
                return item.index === 0;
                });
        })).toBeTruthy();
    });

    // mustContainRhsColIndices works the over way around
    it("test mustContainRhs filter", async () => {

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            FDSortBy: "RHS_NAME",
            mustContainRhsColIndices: [0],
        });

        expect(result.every((item) => {
            return item.rhs.index === 0;
        })).toBeTruthy();
    });

    it("test FDSortBy LHS_COL_ID", async () => {

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            FDSortBy: "LHS_COL_ID",
        });

        expect(result.map((items) => items.lhs.map((item) => item.index))).toStrictEqual([[0], [0, 2], [2]]);
    });

    it("test FDSortBy RHS_COL_ID", async () => {

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            FDSortBy: "RHS_COL_ID",
        });

        expect(result.map((item) => item.rhs.index)).toStrictEqual([1, 1, 2]);
    });

    it("test FDSortBy LHS_NAME", async () => {

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            FDSortBy: "LHS_NAME",
        });

        expect(result.map((items) => items.lhs.map((item) => item.name))).toStrictEqual([["A"], ["A", "C"], ["C"]]);
    });

    it("test FDSortBy RHS_NAME", async () => {

        const result = await getFilteredDeps<Fd>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            FDSortBy: "RHS_NAME",
        });

        expect(result.map((item) => item.rhs.name)).toStrictEqual(["B", "B", "C"]);
    });
});