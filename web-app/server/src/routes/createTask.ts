import path from "path"
import { v1 as uuid }  from "uuid";

import {RequestHandler} from "express";
import {UploadedFile} from "express-fileupload";
import {Pool} from "pg";
import queryString from "querystring";
import sendEvent from "../producer/sendEvent"

const createTaskHandler: RequestHandler<{}, any, any, queryString.ParsedUrlQueryInput> =
    (req, res) => {
  if (!req.files || !req.files.json || !(req.files.json as any).data ) {
    return res.status(400).send("INCORRECT INPUT DATA");
  }
  const json = JSON.parse((req.files.json as any).data);
  console.debug("Input data:", json);
  const pool: Pool = req.app.get("pool");
  let csvTable : UploadedFile;
  let fileName : string;
  if (json.isBuiltinDataset === undefined) {
    return res.status(400).send("INCORRECT INPUT DATA");
  }
  const { isBuiltinDataset } = json;
  try {
    if (json.fileName === undefined) {
      if (isBuiltinDataset || !req.files.table) {
        return res.status(400).send("INCORRECT INPUT DATA");
      }
      csvTable = req.files.table as UploadedFile;
      fileName = uuid() + ".csv";
      csvTable
          .mv("./uploads/" + fileName)
          .then(async () => {
            console.debug(`File ${fileName} was successfully uploaded`);
          })
          .catch((err) => {
            throw err;
          });
    } else {
      fileName = json.fileName;
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Problem with file downloading");
  }

  try {
    if (!isBuiltinDataset) {
      console.debug("File:", csvTable);
    }
    const { algName, errorPercent, separator,
      hasHeader, parallelism, maxLHS } = json;
    const taskID = uuid();
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
    fileName = isBuiltinDataset ? fileName : csvTable.name;
    const query =
        `insert into ${dbTableName}
        (taskID, createdAt, algName, errorPercent, separator,
        status, datasetPath, maxLHS, hasHeader, fileName, parallelism, cancelled) values
        ($1, now(), $2, $3, $4, $5, $6, $7, $8, $9, $10, false)`;
    const params = [taskID, algName, errorPercent, separator, status,
      datasetPath, maxLHS, hasHeader, fileName, parallelism];

    (async () => {
      await pool.query(query, params)
          .then(async (result) => {
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
          .then(async () => {
            console.debug(`Record with taskID = ${taskID} was added to kafka`);
            res.json({ taskID, status: "OK" });
          })
          .catch((err) => {
            console.debug(err);
            res.status(500).json({
              status: "ERROR", msg: "Problem with adding record to kafka"
            });
          });
    })();
  } catch (err) {
    res.status(500).send("Unexpected problem caught: " + err);
  }
}

export = createTaskHandler;
