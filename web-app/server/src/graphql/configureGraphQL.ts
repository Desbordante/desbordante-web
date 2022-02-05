import { ApolloServer } from 'apollo-server-express';
import { Application } from "express";
import { graphqlHTTP } from 'express-graphql';
import { Sequelize } from 'sequelize/dist';

import schema from './schema/schema'

const configureGraphQL = async (app: Application, { models }: Sequelize) => {
    const logger = (msg:string) => { console.log(msg); }

    const graphqlServer = new ApolloServer({
        schema,
        context : { models, logger },
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