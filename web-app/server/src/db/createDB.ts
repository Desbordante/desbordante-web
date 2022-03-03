// @ts-ignore
import pgtools  from "pgtools";

async function createDB() {
  const config = {
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
  };

  return pgtools.createdb(config, process.env.DB_NAME)
      .then(async () => {
        console.log(`Database '${process.env.DB_NAME}' was successfully created`);
      })
      .catch(async (err: any) => {
        if (err.name === "duplicate_database") {
          console.log(`Database '${process.env.DB_NAME}' already exists`);
        } else {
          console.error(err);
          throw err;
        }
      });
}

export = createDB;
