const express = require("express");
const router = new express.Router();
const path = require("path");

const { v1: uuidv1 } = require("uuid");
const sendEvent = require("../producer/sendEvent");

router.post("/createTask", function(req, res) {
  if (!req.body || !req.files) {
    return res.sendStatus(400);
  }

  const pool = req.app.get("pool");
  let csvTable;
  let fileName;
  let isBuiltinDataset;
  try {
    if (!req.body.fileName) {
      console.debug("File Name not provided (=> not builtin dataset)");
      isBuiltinDataset = false;
      csvTable = req.files.file;
      fileName = uuidv1() + ".csv";
      csvTable
          .mv("./uploads/" + fileName)
          .then(() => {
            console.debug(`File ${fileName} was successfully uploaded`);
          })
          .catch((err) => {
            throw err;
          });
    } else {
      isBuiltinDataset = true;
      fileName = req.body.fileName;
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Problem with file downloading");
    return;
  }

  try {
    const json = JSON.parse(req.files.document.data);
    console.debug("Input data:", json);
    if (!isBuiltinDataset) {
      console.debug("File:", csvTable);
    }
    const { algName, errorPercent, separator,
      hasHeader, parallelism, maxLHS } = json;
    const taskID = uuidv1();
    const status = "ADDED TO THE TASK QUEUE";

    // get path to root file (www)
    const rootPath = path.dirname(require.main.filename).split("/");
    if (isBuiltinDataset) {
      rootPath.pop(); // remove folder 'bin'
      rootPath.pop(); // remove folder 'server'
      rootPath.pop(); // remove folder 'web-app'
      rootPath.push("build"); // add folder 'build'
      rootPath.push("target"); // add folder 'target'
      rootPath.push("inputData"); // add folder 'inputData'
      rootPath.push(fileName); // add file '*.csv'
    } else {
      rootPath.pop(); // remove folder 'bin'
      rootPath.push("uploads"); // add folder 'uploads'
      rootPath.push(fileName); // add file '${fileID}.csv'
    }
    const datasetPath = rootPath.join("/");

    const topicName = process.env.KAFKA_TOPIC_NAME;
    const dbTableName = process.env.DB_TASKS_TABLE_NAME;
    fileName = isBuiltinDataset ? req.body.fileName : csvTable.name;
    const query =
        `insert into ${dbTableName}
        (taskID, createdAt, algName, errorPercent, separator, 
        status, datasetPath, maxLHS, hasHeader, fileName, parallelism, cancelled) values
        ($1, now(), $2, $3, $4, $5, $6, $7, $8, $9, $10, false)`;
    const params = [taskID, algName, errorPercent, separator, status,
      datasetPath, maxLHS, hasHeader, fileName, parallelism];

    (async () => {
      await pool.query(query, params)
          .then((result) => {
            if (result !== undefined) {
              console.debug(`Success (task [${taskID}] was added to DB)`);
            } else {
              console.error("Problem with adding task to DB");
              throw new Error("Problem with adding task to DB");
            }
          })
          .catch((err) => {
            console.debug(err);
            console.debug("Error (task wasn't added to DB)");
            res.status(500).send("Problem with adding task to DB");
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
            res.status(500).send("Problem with adding record to kafka");
          });
    })();
  } catch (err) {
    res.status(500).send("Unexpected problem caught: " + err);
  }
});

module.exports = router;
