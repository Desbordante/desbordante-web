const fs = require("fs");
const { parse } = require("fast-csv");

const getSnippetHandler = (req, res) => {
  if (!req.params || !req.params.taskID) {
    console.log("Task ID not provided");
    res.status(400).send("Task ID not provided");
  }
  try {
    const pool = req.app.get("pool");
    const query = `select datasetpath, separator as delimiter, hasheader, renamedheader
                   from ${process.env.DB_TASKS_TABLE_NAME} 
                   where taskid = '${req.params.taskID}'`;
    pool.query(query).then((result) => {
      if (result.rows[0] === undefined) {
        console.log("Incorrect input data");
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
              /* #swagger.responses[200] = {
               schema: { $ref: "#/definitions/Snippet" },
               description: 'Get table snippet.'
              } */
              res.status(200).json(arrData);
            });
      }}).catch((err) => {
      console.debug(`SERVER ERROR [${err}]`);
      res.status(500).send("SERVER ERROR");
    });
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = getSnippetHandler;
