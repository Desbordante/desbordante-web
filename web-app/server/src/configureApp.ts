import cors from "cors";
import express, { Application } from "express";
import { graphqlUploadExpress } from "graphql-upload";
import createError from "http-errors";
import morgan from "morgan";
import { isDevelopment } from "./app";
import { configureSequelize } from "./db/configureSequelize";
import { Permission } from "./db/models/UserInfo/Permission";
import { sequelize } from "./db/sequelize";
import { initBuiltInDatasets } from "./db/initBuiltInDatasets";
import { createDB } from "./db/createDB";
import { initTestData } from "./db/initTestData";
import { configureGraphQL } from "./graphql/configureGraphQL";

function normalizePort (val: string | undefined) {
    if (val) {
        const port = parseInt(val, 10);
        if (!isNaN(port) && port >= 0) {
            return port;
        }
    }
    const errorMessage = `Incorrect port value ${val}`;
    throw new Error(errorMessage);
}

function setMiddlewares (app: Application) {
    app.use(cors());
    app.use(graphqlUploadExpress());
    app.use(morgan("dev"));
}

async function configureDB () {
    console.debug("Configuring database");
    await createDB();
    await configureSequelize(sequelize);

    await Permission.initPermissionsTable();
    await initBuiltInDatasets();

    if (isDevelopment) {
        await initTestData();
    }
}

export const configureApp = async () => {
    const app = express();
    app.set("port", normalizePort(process.env.SERVER_PORT));
    setMiddlewares(app);

    await configureDB();
    await configureGraphQL(app, sequelize);

    app.use((req, res, next) => {
        next(createError(404));
    });

    app.use((err: any, req: any, res: any, next: any) => {
        res.locals.message = err.message;
        res.locals.error = isDevelopment ? err : {};

        res.status(err.status || 500).send(res.locals.error.message);
    });

    return app;
};
