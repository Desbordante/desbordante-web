const express = require("express");
const router = new express.Router();

router.get("/", function(req, res, next) {
  if (!req.query || !req.query.taskID) {return res.sendStatus(400);}
  try {
    const pool = req.app.get("pool");
    const query = `select status, fileName from ${process.env.DB_TASKS_TABLE_NAME} 
                   where taskid = '${req.query.taskID}' and "status" != 'CANCELLED'`;
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
                  "phaseName", "progress", "fileName", "currentPhase", "maxPhase"
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
                         where taskid = '${req.query.taskID}'`;
          switch (res.statusCode) {
            case 200:
              pool.query(query, (err, result) => {
                if (err) {
                  console.error("Error executing query", err.stack);
                } else {
                  res.json(result.rows[0]);
                }
              });
              break;
            case 400:
              res.status(400).send("INCORRECT INPUT DATA");
              break;
            case 500:
            default:
              res.status(500).send("SERVER");
              break;
          }
        })
        .catch((err) => {
          console.debug(`SERVER ERROR [${err}]`);
          res.status(500).send("SERVER ERROR");
        });
  }
  catch (err) {
    throw new Error("Unexpected server behavior [getTaskInfo]: " + err);
  }
});

module.exports = router;

