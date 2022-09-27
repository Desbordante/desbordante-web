import { ApolloServer } from "apollo-server-express";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { getContext } from "./context";
import { loadDocumentsSync } from "@graphql-tools/load";
import path from "path";
import { schema } from "../graphql/schema";

export const getTestServer = async (context = getContext) => ({
    server: new ApolloServer({ schema, context }),
    context: await getContext(),
});

export type ServerInfo = Awaited<ReturnType<typeof getTestServer>>;

export const executeOperation = async <ResultType, VariablesType = never>(
    serverInfo: ServerInfo,
    props: {
        queryName: string;
        dirname: string;
        variables?: VariablesType;
    }
) => {
    const { queryName, dirname, variables } = props;
    const sources = loadDocumentsSync(
        path.resolve(dirname, `./queries/${queryName}.graphql`),
        { loaders: [new GraphQLFileLoader()] }
    );
    const query = sources[0].rawSDL;
    if (query === undefined) {
        throw new Error(`File ${dirname}/${queryName}.graphql not found`);
    }
    const { server } = serverInfo;
    if (!variables) {
        throw new Error("Variables must be defined");
    }
    const result = await server.executeOperation({ query, variables });
    return result as Omit<typeof result, "data"> & { data: ResultType };
};

export const executeOperationsWithDefaultServer = async <
    ResultType,
    VariablesType = never
>(
    params: Parameters<typeof executeOperation<ResultType, VariablesType>>[1],
    context = getContext
) =>
    await executeOperation<ResultType, VariablesType>(
        await getTestServer(context),
        params
    );
