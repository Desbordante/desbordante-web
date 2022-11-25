import { FindOptions } from "sequelize";
import { GraphQLError } from "graphql";
import { Resolvers } from "../../types/types";

export const MetaInfoResolvers: Resolvers = {
    Query: {
        datasets: async (parent, { props }, { models, sessionInfo }) => {
            if (!sessionInfo) {
                throw new GraphQLError("User must be authorized", {
                    extensions: { code: "AuthenticationError" },
                });
            }
            if (!sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new GraphQLError("User doesn't have permissions", {
                    extensions: { code: "ForbiddenError" },
                });
            }

            const { includeBuiltInDatasets, includeDeletedDatasets, pagination } = props;
            let options: FindOptions = { where: { isValid: true }, ...pagination };

            if (includeBuiltInDatasets === false) {
                options.where = { ...options.where, isBuiltInDataset: false };
            }
            if (includeDeletedDatasets === true) {
                options = { ...options, paranoid: false };
            }

            return await models.FileInfo.findAll(options);
        },
    },
};
