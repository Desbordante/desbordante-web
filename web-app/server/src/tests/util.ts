import { ApolloServer } from "apollo-server-express";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { getContext } from "./context";
import { loadDocumentsSync } from "@graphql-tools/load";
import path from "path";
import { schema } from "../graphql/schema";
import { createTestClient } from "apollo-server-integration-testing";
import createContext from "../graphql/context";
import {mock} from "../graphql/context/mock";
import {baseHeaders} from "./headers";

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

export const getServerForIntegrationTests = async () => {
    const server = new ApolloServer({
        schema,
        context: async ({ req: { headers } }) => createContext(headers),
        introspection: true,
    });
    await server.start();

    return createTestClient({
        apolloServer: server,
    });
};

const loadGraphqlQuery = (dirname: string, queryName: string) => {

    const sources = loadDocumentsSync(
        path.resolve(dirname, `./queries/${queryName}.graphql`),
        { loaders: [new GraphQLFileLoader()] }
    );

    return {
        queryText: sources[0].rawSDL,
        queryType: (sources[0].rawSDL) ? sources[0].rawSDL.split(" ")[0] : "query"
    };
};

export const testQuery = async <ResultType extends object, VariablesType extends object = never>(
    props: {
        queryName: string;
        dirname: string;
        variables?: VariablesType;
        headers?: {
            authorization: string;
        }
    }
) => {

    const { query, mutate, setOptions } = await getServerForIntegrationTests();

    const { queryText, queryType } = loadGraphqlQuery(props.dirname, props.queryName);

    setOptions({
        request: {
            headers: {
                ...props.headers,
                ...baseHeaders
            },
        },
    });

    if (!queryText) {
        throw Error("Query test is empty or undefined");
    }

    if (props.variables) {
        const result = await ((queryType === "query") ? query : mutate)<ResultType, VariablesType>(queryText, {
            variables: {
                ...props.variables,
            },
        });
        return result as Omit<typeof result, "data"> & { data: ResultType };
    } else {
        const result = await ((queryType === "query") ? query: mutate)<ResultType>(queryText);
        return result as Omit<typeof result, "data"> & { data: ResultType };
    }
};
