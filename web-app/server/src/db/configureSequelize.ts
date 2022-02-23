import { Sequelize } from "sequelize-typescript";

const configureSequelizeModels = async (sequelize: Sequelize) => {
    const force = process.env.DB_FORCE_TABLES_RECREATION === "true";
    await sequelize.sync({ force });
};

export = configureSequelizeModels;
