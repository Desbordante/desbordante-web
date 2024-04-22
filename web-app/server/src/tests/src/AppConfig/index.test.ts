import { AlgorithmsConfig } from "./queries/__generated__/AlgorithmsConfigQuery";
import { AllowedDatasetsQuery } from "./queries/__generated__/AllowedDatasetsQuery";
import { executeOperationsWithDefaultServer } from "../../util";

it("returns info about app configuration", async () => {
    const result = await executeOperationsWithDefaultServer<AlgorithmsConfig>({
        dirname: __dirname,
        queryName: "AlgorithmsConfigQuery",
    });

    expect(result.data).toBeDefined();
    expect(result.errors).toBeUndefined();
    expect(result.data.algorithmsConfig.maxThreadsCount).toBe(8);
    expect(result.data.algorithmsConfig.fileConfig.userDiskLimit).toBe(10000000000);
    expect(result.data.algorithmsConfig.allowedFDAlgorithms.length).toBe(8);
});

it("query info about built in datasets", async () => {
    const result = await executeOperationsWithDefaultServer<AllowedDatasetsQuery>({
        dirname: __dirname,
        queryName: "AllowedDatasetsQuery",
    });

    expect(result.data).toBeDefined();
    const { algorithmsConfig } = result.data;
    expect(algorithmsConfig.allowedDatasets.length).toBe(8);
});
