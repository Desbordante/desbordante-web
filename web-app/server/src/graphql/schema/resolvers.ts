import merge from "lodash/merge";

import { GraphQLUpload } from "graphql-upload";
import MetaInfoResolvers from "./MetaInfoResolvers/resolvers";
import TaskCreatingResolvers from "./TaskCreating/resolvers";
import { AppConfigResolvers } from "./AppConfiguration/resolvers";
import TaskInfoResolvers from "./TaskInfo/resolvers";
import { UserResolvers } from "./UserResolvers/resolvers";

export = merge(
    AppConfigResolvers,
    TaskInfoResolvers,
    TaskCreatingResolvers,
    MetaInfoResolvers,
    { Upload: GraphQLUpload },
    UserResolvers
);
