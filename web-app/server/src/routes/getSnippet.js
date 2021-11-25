const express = require("express");
const router = new express.Router();
const fs = require("fs");
const { parse } = require("fast-csv");

router.get("/", function(req, res) {
  if (!req.query || !req.query.taskID) {
    return res.sendStatus(400);
  }
  try {
    const pool = req.app.get("pool");
    const query = `select datasetpath, separator as delimiter, hasheader, renamedheader
                   from ${process.env.DB_TASKS_TABLE_NAME} 
                   where taskid = '${req.query.taskID}'`;
    pool.query(query, (err, result) => {
      if (err) {
        return console.error("Error while trying to get snippet data ", err.stack);
      } else {
        if (result.rows[0] === undefined) {
          res.status(400).send("Invalid taskID");
        } else {
          const { datasetpath, delimiter, hasheader, renamedheader } = result.rows[0];
          const arrData = [];
          const maxRows = 100;
          const parser = parse({ delimiter, maxRows });
          fs.createReadStream(datasetpath)
              .pipe(parser)
              .on("error", (error) => {
                console.error(error);
                res.status(400).send(error);
              })
              .on("data", (row) => {
                arrData.push(row);
              })
              .on("end", (rowCount) => {
                console.log(`Parsed ${rowCount} rows`);
                if (hasheader) {
                  arrData.shift();
                }
                // renamedHeader is created by consumer
                arrData.unshift(JSON.parse(renamedheader));
                res.json(arrData);
              });
        }
      }
    }).catch((err) => {
      console.debug(`SERVER ERROR [${err}]`);
      res.status(500).send("SERVER ERROR");
    });
  } catch (err) {
    throw new Error("Unexpected server behavior " + err);
  }
});

module.exports = router;
