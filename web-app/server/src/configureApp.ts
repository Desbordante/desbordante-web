import express, { Application } from "express";
import { Permission } from "./db/models/UserData/Permission";
import config from "./config";
import { configureGraphQL } from "./graphql/configureGraphQL";
import { configureSequelize } from "./db/configureSequelize";
import cors from "cors";
import { createDB } from "./db/createDB";
import createError from "http-errors";
import { graphqlUploadExpress } from "graphql-upload";
import { initBuiltInDatasets } from "./db/initBuiltInDatasets";
import { initTestData } from "./db/initTestData";
import morgan from "morgan";
import { sequelize } from "./db/sequelize";

function setMiddlewares(app: Application) {
    app.use(cors());
    app.use(graphqlUploadExpress());
    app.use(morgan("dev"));
}

async function configureDB() {
    console.debug("Configuring database");
    await createDB();
    await configureSequelize(sequelize);

    await Permission.initPermissionsTable();
    await initBuiltInDatasets();

    if (config.isDevelopment) {
        await initTestData();
    }
}

export const configureApp = async () => {
    const app = express();
    setMiddlewares(app);

    await configureDB();
    await configureGraphQL(app);

    app.use((req, res, next) => {
        next(createError(404));
    });

    app.use((err: any, req: any, res: any, next: any) => {
        res.locals.message = err.message;
        res.locals.error = config.isDevelopment ? err : {};

        res.status(err.status || 500).send(res.locals.error.message);
    });

    return app;
};
