
const getTaskInfoHandler = (req, res, next) => {
  // #swagger.tags = ['getTaskInfo']
  // #swagger.description = 'Endpoint for getting task info.'
  // #swagger.parameters['taskID'] = { description: 'Unique task identifier.' }
  if (!req.params || !req.params.taskID) {
    res.sendStatus(400);
  }
  try {
    const pool = req.app.get("pool");
    const query = `select status, fileName from ${process.env.DB_TASKS_TABLE_NAME} 
                   where taskid = '${req.params.taskID}' and "status" != 'CANCELLED'`;
    pool.query(query)
        .then((result) => {
          let selectedAttrs = [];
          if (result.rows[0] === undefined) {
            res.statusCode = 400;
          } else {
            const status = result.rows[0].status;
            switch (status) {
              case "IN PROCESS":
              case "ADDED TO THE TASK QUEUE":
                selectedAttrs = [
                  "phaseName", "progress", "currentPhase",
                  "maxPhase", "fileName", "status"
                ];
                res.statusCode = 200;
                break;
              case "COMPLETED":
                selectedAttrs = [
                  "phaseName", "progress", "currentPhase", "maxPhase",
                  "status", "fileName", "fds::json", "arrayNameValue::json",
                  "renamedHeader::json as columnNames",
                  "PKColumnPositions::json, elapsedTime",
                  "errorPercent", "elapsedTime", "maxLHS", "parallelism",
                  "trim(algName) as algName"
                ];
                res.statusCode = 200;
                break;
              default:
              case "SERVER ERROR":
                console.log(`SERVER ERROR: ${result.rows[0]}`);
                res.statusCode = 500;
                break;
              case "INCORRECT INPUT DATA":
                selectedAttrs = ["status", "errorStatus", "fileName"];
                res.statusCode = 400;
                break;
            }
          }
          const query = `select ${selectedAttrs.join(", ")}
                         from ${process.env.DB_TASKS_TABLE_NAME}
                         where taskid = '${req.params.taskID}'`;
          switch (res.statusCode) {
            case 200:
              /* #swagger.responses[200] = {
               schema: { $ref: "#/definitions/Task" },
               description: 'Information about task.'
              } */
              pool.query(query, (err, result) => {
                if (err) {
                  console.error("Error executing query", err.stack);
                } else {
                  const debugAnswer = JSON.parse(JSON.stringify(result.rows[0]));
                  debugAnswer.taskID = req.params.taskID;
                  if (debugAnswer.fds) {
                    debugAnswer.fdsCount = debugAnswer.fds.length;
                    delete debugAnswer.fds;
                  }
                  if (debugAnswer.arraynamevalue) {
                    delete debugAnswer.arraynamevalue;
                  }
                  if (debugAnswer.columnnames) {
                    delete debugAnswer.columnnames;
                  }
                  console.debug(`Answer (compact):\n${JSON.stringify(debugAnswer)}`);
                  res.json(result.rows[0]);
                }
              });
              break;
            case 400:
              res.status(400).send("INCORRECT INPUT DATA");
              break;
            case 500:
            default:
              res.status(500).send("SERVER ERROR");
              break;
          }
        })
        .catch((err) => {
          console.debug(`SERVER ERROR [${err}]`);
          res.status(500).send("SERVER ERROR");
        });
  }
  catch (err) {
    throw new Error("Unexpected server behavior: " + err);
  }
};

module.exports=getTaskInfoHandler;
