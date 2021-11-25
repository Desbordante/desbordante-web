const express = require("express");
const router = new express.Router();
const path = require("path");

const { v1: uuidv1 } = require("uuid");
const sendEvent = require("../producer/sendEvent");

router.post("/createTask", function(req, res) {
  if (!req.body) {
    return res.sendStatus(400);
  }

  const pool = req.app.get("pool");
  const taskID = uuidv1();
  let table;
  let fileName;

  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      table = req.files.file;
      fileName = taskID + table.name;
      table
          .mv("./uploads/" + fileName)
          .then(() => {
            console.debug(`File ${fileName} was successfully uploaded`);
          })
          .catch((err) => {
            throw err;
          });
    }
  } catch (err) {
    res.status(500).send("Problem with file downloading");
  }

  try {
    const json = JSON.parse(req.files.document.data);
    console.debug("Input data:", json);
    console.debug("File:", table);

    const { algName, errorPercent, separator,
      hasHeader, parallelism, maxLHS } = json;

    const status = "ADDED TO THE TASK QUEUE";
    const progress = 0.0;

    // get path to root file (www)
    const rootPath = path.dirname(require.main.filename).split("/");

    rootPath.pop(); // remove folder 'bin'
    rootPath.push("uploads"); // add folder 'uploads'
    rootPath.push(fileName); // add file '${taskID} + filename.csv'

    const datasetPath = rootPath.join("/");

    const topicName = process.env.KAFKA_TOPIC_NAME;
    const query =
        `insert into ${process.env.DB_TASKS_TABLE_NAME}
        (taskID, createdAt, algName, errorPercent, separator, progress, 
        status, datasetPath, maxLHS, hasHeader, fileName, parallelism, cancelled) values
        ($1, now(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false)`;
    const params = [taskID, algName, errorPercent, separator,
      progress, status, datasetPath, maxLHS,
      hasHeader, table.name, parallelism];

    (async () => {
      await pool.query(query, params)
          .then((result) => {
            if (result !== undefined) {
              console.debug(`Success (task [${taskID}] was added to DB)`);
            } else {
              throw new Error("Problem with adding task to DB");
            }
          })
          .catch(() => {
            console.debug("Error (task wasn't added to DB)");
            res.status(400).send("Problem with adding task to DB");
          });
      await sendEvent(topicName, taskID)
          .then(() => {
            console.debug("Record was added to kafka");
            const json = JSON.stringify({ taskID, status: "OK" });
            console.debug("Response: " + json);
            res.send(json);
          })
          .catch((err) => {
            console.debug(err);
            res.status(400).send("Problem with sending a response");
          });
    })();
  } catch (err) {
    res.status(500).send("Unexpected problem caught: " + err);
  }
});

module.exports = router;
