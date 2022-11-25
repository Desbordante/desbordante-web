import { Express } from "express";
import { Permission } from "./db/models/UserData/Permission";
import config from "./config";
import { configureGraphQL } from "./graphql/configureGraphQL";
import { configureSequelize } from "./db/configureSequelize";
import { createDB } from "./db/createDB";
import { initBuiltInDatasets } from "./db/initBuiltInDatasets";
import { initTestData } from "./db/initTestData";
import { sequelize } from "./db/sequelize";

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

export const configureApp = async (): Promise<Express> => {
    await configureDB();
    return await configureGraphQL();
};
