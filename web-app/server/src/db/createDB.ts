import { config } from "../config";
// @ts-ignore
import pgtools from "pgtools";

type CreateDbErrorType = {
    name:
        | "duplicate_database"
        | "invalid_catalog_name"
        | "unique_violation"
        | "drop_database_in_use";
    message: string;
};

const { host, password, username: user, port, database } = config.database;

const props = {
    host,
    password,
    user,
    port,
};

export const createDB = async () =>
    pgtools
        .createdb(props, database)
        .then(() => console.debug(`DB ${database} was created successfully`))
        .catch((err: CreateDbErrorType) => {
            if (err.name === "duplicate_database") {
                console.log(`Database '${database}' already exists`);
            } else {
                throw err;
            }
        });
