import cors from "cors"
import createError from "http-errors"
import fileUpload from "express-fileupload"
import morgan from "morgan"
import express, { Application } from 'express'

import configureDB from "./db/configureDB"
import setEndpoints from "./routes/setEndpoints"

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
    app.use(fileUpload({ createParentPath: true }));
    app.use(morgan("dev"));
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

    // Add middlewares
    await setMiddlewares(app)
        .then(() => {
            console.debug("Middlewares were successfully applied");
        })
        .catch((err) => {
            console.error(`Error: ${err.message}`);
            throw new Error("Error while setting middlewares");
        })

    // Add routes (endpoints)
    await setEndpoints(app)
        .then(() => {
            console.debug("Endpoints were successfully set");
        })
        .catch((err) => {
            console.error(`Error: ${err.message}`);
            throw new Error("Error while setting routes");
        });

    // Catch 404 and forward to error handler
    app.use((req, res, next) => {
        next(createError(404));
    });

    // @ts-ignore
    // Error handler
    app.use((err, req, res, next) => {
        // Set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};

        // Render the error page
        res.status(err.status || 500).send(res.locals.error.message);
    });

    return app;
}

export = configureApp;
