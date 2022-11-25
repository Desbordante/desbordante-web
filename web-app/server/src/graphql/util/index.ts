import { GraphQLError } from "graphql";

export type Pagination = { offset: number; limit: number };

const defaultMaxLimit = 500;

export const applyPagination = <T>(
    data: T[],
    pagination: Pagination,
    maxLimit = defaultMaxLimit
) => {
    const { offset, limit } = pagination;
    if (offset < 0) {
        throw new GraphQLError("Offset cannot be less, than 0", {
            extensions: { code: "UserInputError", pagination },
        });
    } else if (limit < 0 || limit > maxLimit) {
        throw new GraphQLError(
            `Limit must be greater than zero, and less than maxLimit (${maxLimit})`,
            {
                extensions: { code: "UserInputError", pagination },
            }
        );
    }
    return data.slice(offset, offset + limit);
};

export const returnParent = <T>(parent: T) => parent;

export const resolverCannotBeCalled = () => {
    throw new GraphQLError("The resolver function cannot be called by this interface");
};
