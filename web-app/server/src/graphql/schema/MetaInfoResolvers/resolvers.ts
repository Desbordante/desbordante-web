import { FindOptions } from "sequelize";
import { Resolvers } from "../../types/types";

const MetaInfoResolvers : Resolvers = {
    Query: {
        datasets: async (parent, { props }, { models, logger }) => {
            const { includeBuiltInDatasets, includeDeletedDatasets,
                offset, limit } = props;
            let options: FindOptions = {
                attributes: [['ID', "fileID"]],
                where: {},
                offset, limit
            };

            if (includeBuiltInDatasets === false) {
                options.where = { ...options.where, isBuiltInDataset: false };
            }
            if (includeDeletedDatasets === true) {
                options = { ...options, paranoid: false };
            }

            return await models.FileInfo.findAll(options)
                .then((files:any[]) => files.map(file => file.dataValues));
        },
    },
}

export = MetaInfoResolvers;
