// @ts-ignore
import pgtools from "pgtools";

type CreateDbErrorType = {
  name: "duplicate_database" | "invalid_catalog_name" | "unique_violation" | "drop_database_in_use";
  message: string
}

const config = {
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
};

export const createDB = async () => {
  return pgtools.createdb(config, process.env.DB_NAME)
      .then(() => {
        console.debug(`DB ${process.env.DB_NAME} was created successfully`);
      })
      .catch((err: CreateDbErrorType) => {
        if (err.name === "duplicate_database") {
          console.log(`Database '${process.env.DB_NAME}' already exists`);
        } else {
          throw err;
        }
      });
};
