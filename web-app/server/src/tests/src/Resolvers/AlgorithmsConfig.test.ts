import { testQuery } from "../../util";
import { algorithmsConfig, algorithmsConfigVariables } from "./queries/__generated__/algorithmsConfig";

describe("test resolver for AlgorithmsConfig",() => {

    it("algorithms config", async () => {

        const result = await testQuery<algorithmsConfig, algorithmsConfigVariables>({
            dirname: __dirname,
            queryName: "algorithmsConfig",
        });

        expect(result).toBeTruthy();
        expect(result.data).toBeTruthy();
        expect(result.errors).toBeFalsy();
        expect(result.data.algorithmsConfig).toBeTruthy();

        const config = result.data.algorithmsConfig;

        expect(config.allowedARAlgorithms).toBeDefined();
        expect(config.allowedFDAlgorithms).toBeDefined();
        expect(config.allowedDatasets).toBeDefined();
        expect(config.allowedCFDAlgorithms).toBeDefined();
        expect(config.fileConfig).toBeDefined();
        expect(config.maxThreadsCount).toBeDefined();
    });
});
