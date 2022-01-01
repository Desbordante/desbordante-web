import {ApolloServer, ApolloServerExpressConfig} from 'apollo-server-express';
import { Application } from "express";
import { graphqlHTTP } from 'express-graphql';

import schema from './schema/schema'
import {Pool} from "pg";

const configureGraphQL = async (app: Application) => {
    const pool: Pool = app.get('pool');
    const graphqlServer = new ApolloServer({
        schema,
        context : { pool },
        introspection: true
    });
    app.get(
        '/graphql',
        graphqlHTTP({
            schema,
            graphiql: true
        })
    );
    await graphqlServer.start();

    graphqlServer.applyMiddleware({
        app,
        path: '/graphql'
    });
}

export = configureGraphQL;
