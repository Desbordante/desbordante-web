import { Sequelize } from "sequelize-typescript";
import { config } from "../config";
import { models } from "./models";

export const sequelize = new Sequelize({
    dialect: "postgres",
    models: Object.values(models),
    logging: false,
    ...config.database,
});
