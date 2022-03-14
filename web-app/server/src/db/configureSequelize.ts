import { Sequelize } from "sequelize-typescript";

export const configureSequelize = async (sequelize: Sequelize) => {
    await sequelize.authenticate()
        .then(() => console.debug("Connection with DB was established"))
        .catch(err => new Error(`Error while connecting to DB: ${err.message}`));

    const force = process.env.DB_FORCE_TABLES_RECREATION === "true";

    await sequelize.sync({ force })
        .then(() => console.debug("Models was configured successfully"))
        .catch(err => new Error(`Error while configuring models ${err}`));
};
