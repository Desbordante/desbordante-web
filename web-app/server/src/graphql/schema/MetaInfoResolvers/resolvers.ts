import { FindOptions } from "sequelize";
import { Resolvers } from "../../types/types";

const MetaInfoResolvers : Resolvers = {
    Query: {
        datasets: async (parent, { props }, { models, logger }) => {
            const { includeBuiltInDatasets, includeDeletedDatasets } = props;
            let options: FindOptions = { where: {} }

            if (includeBuiltInDatasets === false) {
                options.where = { ...options.where, isBuiltInDataset: false };
            }
            if (includeDeletedDatasets === true) {
                options = { ...options, paranoid: false };
            }
            return await models.FileInfo.findAll(options);
            },
    },
}

export = MetaInfoResolvers;
