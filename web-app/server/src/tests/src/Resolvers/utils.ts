import { MainPrimitiveType } from "../../../db/models/TaskData/configs/GeneralTaskConfig";
import { testQuery } from "../../util";
import { datasets, datasetsVariables } from "./queries/__generated__/datasets";

export const getDatasetForPrimitive = async (primitive: MainPrimitiveType, accessToken: string, fileName = ""): Promise<string> => {
    const result = await testQuery<datasets, datasetsVariables>({
        dirname: __dirname,
        queryName: "datasets",
        variables: {
            props: {
                includeBuiltInDatasets: true,
            },
            filter: {},
        },
        headers: {
            authorization: "Bearer " + accessToken,
        },
    });

    if (result && result.data && result.data.datasets) {

        const dataset = result.data.datasets.find((_) => {
            return _.supportedPrimitives.includes(primitive) && (_.fileName === fileName || fileName === "");
        });

        if (dataset && dataset.fileID) {
            return dataset.fileID;
        }
    }

    throw Error("There is no dataset that supports ${primitive}");

};
