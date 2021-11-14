const pgtools = require('pgtools');

async function createDB() {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        host: process.env.DB_HOST,
    }

    return pgtools.createdb(config, process.env.DB_NAME)
    .then(async(res) => {
            console.log(`Database '${process.env.DB_NAME}' was successfully created`);
        }
    )
    .catch(async(err) => {
        if (err.name === 'duplicate_database') {
            console.log(`Database '${process.env.DB_NAME}' already exists`)
        } else {
            console.log(err);
            process.exit();
        }
    })
}

module.exports = createDB;