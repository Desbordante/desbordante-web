import express from "express";

import createPool from "./createPool";
import createDB from "./createDB";

async function configureDB(app: express.Application) {
    return createDB()
        .then(async () => {
            return await createPool();
        })
        .catch((err) => {
            console.error(err);
            throw err;
        });
}

export = configureDB;
