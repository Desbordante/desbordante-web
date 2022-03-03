import { ForbiddenError } from "apollo-server-core";
import { AuthenticationError } from "apollo-server-express";
import { FindOptions } from "sequelize";
import { Resolvers } from "../../types/types";

const MetaInfoResolvers : Resolvers = {
    Query: {
        datasets: async (parent, { props }, { models, logger, sessionInfo }) => {
            if (!sessionInfo) {
                throw new AuthenticationError("User must be authorized");
            }
            if (!sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new ForbiddenError("User doesn't have permissions");
            }

            const { includeBuiltInDatasets, includeDeletedDatasets, offset, limit } = props;
            let options: FindOptions = {
                attributes: ["ID"],
                where: {},
                offset, limit,
            };

            if (includeBuiltInDatasets === false) {
                options.where = { ...options.where, isBuiltInDataset: false };
            }
            if (includeDeletedDatasets === true) {
                options = { ...options, paranoid: false };
            }

            return await models.FileInfo.findAll(options)
                .then(files => files.map(file => ({ fileID: file.ID })));
        },
    },
};

export = MetaInfoResolvers;
