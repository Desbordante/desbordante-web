import { cleanUp, createTestData, getFilteredDeps } from "./util";
import { Ar } from "../../__generated__/types";
import { basePagination } from "../../headers";

let taskID: string;
let fileID: string;

jest.setTimeout(10000);

describe("test filters on AR task", () => {

    beforeAll(async () => {
        await createTestData("AR", "0.8:1:2;0.6:2:1;0.9:0:1", "Apriori").then(({ taskUUID, fileUUID }) => {
            taskID = taskUUID;
            fileID = fileUUID;
        });
    });

    afterAll(async () => {
        await cleanUp("AR", taskID, fileID);
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


    it("test filter string \"A\"", async () => {

        const result = await getFilteredDeps<Ar>(taskID, {
            filterString: "A",
            orderBy: "ASC",
            pagination: {
                offset: 0,
                limit: -1,
            },
            ARSortBy: "DEFAULT",
        });

        expect(result.map(({ lhs, rhs }) =>
            [...lhs, ...rhs]).every((items) => items.some((item) => item === "A"))
        ).toBeTruthy();
    });

    it("test ARSortBy LHS_NAME", async () => {

        const result = await getFilteredDeps<Ar>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            ARSortBy: "LHS_NAME",
        });

        expect(result.map((items) => items.lhs.map((item) => item))).toStrictEqual([["A"], ["B"], ["C"]]);
    });

    it("test ARSortBy RHS_NAME", async () => {

        const result = await getFilteredDeps<Ar>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            ARSortBy: "RHS_NAME",
        });

        expect(result.map((items) => items.rhs.map((item) => item))).toStrictEqual([["B"], ["B"], ["C"]]);
    });

    it("test ARSortBy CONF", async () => {

        const result = await getFilteredDeps<Ar>(taskID, {
            filterString: "",
            orderBy: "ASC",
            ...basePagination,
            ARSortBy: "CONF",
        });

        expect(result.map((item) => item.confidence)).toStrictEqual([0.6, 0.8, 0.9]);
    });

});