import { ApolloError, UserInputError } from "apollo-server-core";
import config from "../../config";

export type Pagination = { offset: number; limit: number };

const defaultMaxLimit = 500;

export const applyPagination = <T>(
    data: T[],
    pagination: Pagination,
    maxLimit = defaultMaxLimit
) => {
    const { offset, limit } = pagination;
    if (config.isTest && limit === -1) {
        return data;
    }
    if (offset < 0) {
        throw new UserInputError("Offset cannot be less, than 0", pagination);
    } else if (limit < 0 || limit > maxLimit) {
        return [];
        throw new UserInputError(
            `Limit must be greater than zero, and less than maxLimit (${maxLimit})`,
            pagination
        );
    }
    return data.slice(offset, offset + limit);
};

export const returnParent = <T>(parent: T) => parent;

export const resolverCannotBeCalled = () => {
    throw new ApolloError("The resolver function cannot be called by this interface");
};
