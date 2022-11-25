import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { Context } from "./types/context";
import cors from "cors";
import createContext from "./context";
import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import { graphqlUploadExpress } from "graphql-upload";
import http from "http";
import { json } from "body-parser";
import morgan from "morgan";
import schema from "./schema";

export const configureGraphQL = async () => {
    const app = express();
    const httpServer = http.createServer(app);
    const server = new ApolloServer<Context>({
        schema,
        introspection: true,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            ApolloServerPluginLandingPageLocalDefault({}),
        ],
    });

    await server
        .start()
        .then(() => console.debug("GraphQL was successfully configured"))
        .catch(() => new Error("Error while graphql configuring"));

    app.use(
        "/graphql",
        json(),
        cors<cors.CorsRequest>(),
        graphqlUploadExpress(),
        morgan("dev"),
        expressMiddleware(server, {
            context: async ({ req: { headers } }) => createContext(headers),
        })
    );
    return app;
};
