const createPool = require('./createPool');
const createTable = require('./createTable');
const dropTableTasks = require('./dropTable');
const createDB = require('./createDB');

async function configureApp(app) {
  return createDB()
  .then(async(res) => { 
    return await createPool();
  })
  .then(async(pool) => {
    await dropTableTasks(pool);
    return pool;
  })
  .then(async(pool) => { 
    app.set('pool', pool); 
    await createTable(pool);
    return pool;
  })
  .catch(async(err) => {
    console.log(err);
    throw err;
  })
}

module.exports = configureApp;