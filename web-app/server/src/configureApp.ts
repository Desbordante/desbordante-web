import express, { Application } from "express";
import { Permission } from "./db/models/User";
import { sequelize } from "./db/sequelize";
import configureDB from "./db/configureDB";
import configureGraphQL from "./graphql/configureGraphQL";
import configureSequelize from "./db/configureSequelize";
import cors from "cors";
import createError from "http-errors";
import { graphqlUploadExpress } from "graphql-upload";
import initBuiltInDatasets from "./db/initBuiltInDatasets";
import morgan from "morgan";
import expressJwt from "express-jwt";

function normalizePort(val: string | undefined) {
    if (val) {
        const port = parseInt(val, 10);
        if (!isNaN(port) && port >= 0) {
            return port;
        }
    }
    const errorMessage = `Incorrect port value ${val}`;
    throw new Error(errorMessage);
}

async function setMiddlewares(app: Application) {
    app.use(cors());
    app.use(graphqlUploadExpress());
    app.use(morgan("dev"));
    app.use(
        expressJwt({
            secret: process.env.SECRET_KEY!,
            algorithms: ["HS256"],
            credentialsRequired: false,
        })
    );
}

async function configureApp() {
    const app = express();
    app.set("port", normalizePort(process.env.SERVER_PORT));

    await configureDB(app)
        .then(() => {
            console.debug("Database was configured successfully");
        })
        .catch(err => {
            throw new Error(`Error while configuring the application ${err}`);
        });

    await sequelize.authenticate()
        .then(() => {
            console.debug("Connection with DB was established");
        })
        .catch(err => {
            throw new Error(`Error while connecting to DB: ${err}`);
        });

    await configureSequelize(sequelize)
        .then(() => {
            console.debug("Models was configured successfully");
        })
        .catch(err => {
            throw new Error(`Error while configuring models ${err}`);
        });

    await Permission.initPermissionsTable()
        .then(() => {
            console.log("Permissions table was initialized");
        });

    await initBuiltInDatasets(sequelize)
        .then(() => {
            console.debug("BuiltIn datasets was initialized");
        })
        .catch(err => {
            throw new Error(`Error while initializing built-in datasets ${err}`);
        });

    await setMiddlewares(app)
        .then(() => {
            console.debug("Middlewares were successfully applied");
        })
        .catch((err) => {
            console.error(`Error: ${err.message}`);
            throw new Error("Error while setting middlewares");
        });

    await configureGraphQL(app, sequelize)
        .then(() => {
            console.debug("GraphQL was successfully configured");
        })
        .catch((err) => {
            console.error(`Error: ${err.message}`);
            throw new Error("Error while graphql configuring");
        });

    // Catch 404 and forward to error handler
    app.use((req, res, next) => {
        next(createError(404));
    });

    // Error handler
    app.use((err: any, req: any, res: any, next: any) => {
        // Set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};

        res.status(err.status || 500).send(res.locals.error.message);
    });

    return app;
}

export = configureApp;
