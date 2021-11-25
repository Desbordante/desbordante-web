async function dropTableTasks(pool) {
  return pool.query(`DROP TABLE IF EXISTS ${process.env.DB_TASKS_TABLE_NAME}`)
      .then(async () => {
        console.log(`Tables in DB '${process.env.DB_NAME}' was successfully dropped`);
      })
      .catch(async (err) => {
        console.error(`Problem with dropping table ${process.env.DB_TASKS_TABLE_NAME}`);
        throw err;
      });
}

module.exports = dropTableTasks;
