import { Sequelize } from "sequelize-typescript";

export const configureSequelizeModels = async (sequelize: Sequelize) => {
    const force = process.env.DB_FORCE_TABLES_RECREATION === "true";
    return await sequelize.sync({ force });
};
