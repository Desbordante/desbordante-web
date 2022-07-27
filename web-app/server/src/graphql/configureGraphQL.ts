import { ApolloServer } from "apollo-server-express";
import { Application } from "express";
import { config } from "../config";
import createContext from "./context";
import { graphqlHTTP } from "express-graphql";
import schema from "./schema";

export const configureGraphQL = async (app: Application) => {
    const graphqlServer = new ApolloServer({
        schema,
        context: async ({ req: { headers } }) => createContext(headers),
        introspection: true,
    });
    app.get(
        "/graphql",
        graphqlHTTP({
            schema,
            graphiql: config.isDevelopment,
        })
    );
    await graphqlServer
        .start()
        .then(() => console.debug("GraphQL was successfully configured"))
        .catch(() => new Error("Error while graphql configuring"));

    graphqlServer.applyMiddleware({
        app,
        path: "/graphql",
    });
};
