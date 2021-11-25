async function createTable(pool) {
  console.log(`Creating table(-es) in DB '${process.env.DB_TASKS_TABLE_NAME}'`);
  const tableName = process.env.DB_TASKS_TABLE_NAME;

  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
    taskID char(40) not null primary key,
    createdAt timestamp not null,
    algName char(10) not null,
    errorPercent real not null CHECK (errorPercent >= 0 AND errorPercent <= 1),
    separator char(1) not null,
    progress real not null CHECK (progress >= 0 AND progress <= 100),
    currentPhase int CHECK (currentPhase >= 1),
    maxPhase int CHECK (maxPhase >=1),
    phaseName text,
    elapsedTime bigint CHECK (elapsedTime >= 0),
    status varchar(30) not null 
    CHECK (
        status in ('ADDED TO THE TASK QUEUE', 'IN PROCESS', 'COMPLETED',
                   'INCORRECT INPUT DATA', 'SERVER ERROR', 'CANCELLED')
    ),
    errorStatus text,
    datasetPath text not null,
    fileName text not null,
    FDs text,
    hasHeader bool not null,
    renamedHeader text,
    PKColumnPositions text,
    maxLHS int not null,
    parallelism int not null,
    cancelled bool not null,
    arrayNameValue text)
  `;
  return pool
      .query(query)
      .then(async (res) => {
        if (res !== undefined) {
          console.log(`Table '${tableName}' was successfully created.`);
        }
      }).catch(async (err) => {
        console.log("Error with table creation");
        throw err;
      });
}

module.exports = createTable;
