import { AppConfigResolvers } from "./AppConfiguration/resolvers";
import { GraphQLUpload } from "graphql-upload";
import { MetaInfoResolvers } from "./MetaInfoResolvers/resolvers";
import { TaskCreatingResolvers } from "./TaskCreating/resolvers";
import { TaskInfoResolvers } from "./TaskInfo/resolvers";
import { UserResolvers } from "./UserResolvers/resolvers";
import merge from "lodash/merge";

export const resolvers = merge(
    AppConfigResolvers,
    TaskInfoResolvers,
    TaskCreatingResolvers,
    MetaInfoResolvers,
    { Upload: GraphQLUpload },
    UserResolvers
);

export default resolvers;
