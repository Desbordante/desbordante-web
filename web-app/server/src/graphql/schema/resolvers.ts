import merge from "lodash/merge";
import { GraphQLUpload } from "graphql-upload"

import { Resolvers } from "../types/types";

import MetaInfoResolvers from "./MetaInfoResolvers/resolvers";
import TaskCreatingResolvers from "./TaskCreating/resolvers";
import AppConfigResolvers from "./AppConfiguration/resolvers";
import TaskInfoResolvers from "./TaskInfo/resolvers";

// TODO
const UserResolvers : Resolvers = {
    Query: {
        user: async(parent, { id }, { models, logger }) => {
            return models.User.findOne({ where: { id } });
        },
    }
}

export = merge(
    AppConfigResolvers,
    TaskInfoResolvers,
    TaskCreatingResolvers,
    MetaInfoResolvers,
    { Upload: GraphQLUpload },
    UserResolvers
);
