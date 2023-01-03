import { testQuery } from "../../util";
import { algorithmsConfig, algorithmsConfigVariables } from "./queries/__generated__/algorithmsConfig";

describe("test resolver for AlgorithmsConfig",() => {

    it("algorithms config", async () => {

        const result = await testQuery<algorithmsConfig, algorithmsConfigVariables>({
            dirname: __dirname,
            queryName: "algorithmsConfig",
        });

        expect(result.data).toBeTruthy();
        expect(result.errors).toBeFalsy();
        expect(result.data.algorithmsConfig).toBeTruthy();
    });
});
