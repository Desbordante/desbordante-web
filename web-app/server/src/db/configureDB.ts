import express from "express";
import { Pool } from "pg";

import createPool from "./createPool"
import createTable from "./createTable"
import dropTableTasks from "./dropTable"
import createDB from "./createDB"

async function configureDB(app: express.Application) {
    return createDB()
        .then(async () => {
            return await createPool();
        })
        // .then(async (pool: Pool) => {
        //     await dropTableTasks(pool);
        //     return pool;
        // })
        .then(async (pool: Pool) => {
            app.set("pool", pool);
            await createTable(pool);
            return pool;
        })
        .catch((err: any) => {
            console.error(err);
            throw err;
        });
}

export = configureDB;
