var express = require('express');
var router = express.Router();
var fs = require('fs');
var { parse } = require ('fast-csv');

router.get('/', function(req, res, next) {
    if(!req.query || !req.query.taskID) return res.sendStatus(400);
    try{
        const pool = req.app.get('pool')
        var answer;
        pool.query(`select datasetpath, separator as delimiter, hasheader
                    from ${process.env.DB_TASKS_TABLE_NAME} 
                    where taskid = '${req.query.taskID}'
                   `)
        .then(result => {
            if (result.rows[0] === undefined) {
                res.status(400).send("Invalid taskID");
                return;
            }
            const { datasetpath, delimiter, hasheader } = result.rows[0];
            return { datasetpath, delimiter, hasheader };
        })
        .then(({ datasetpath, delimiter, hasheader }) => {            
            var arrData = [];
            const maxRows = 100;
            const parser = parse({
                delimiter,
                maxRows,
            });
            fs.createReadStream(datasetpath)
            .pipe(parser)
            .on('error', error => {
                console.error(error);
                res.status(400).send(err);
            })
            .on('data', row => {
                arrData.push(row)
            })
            .on('end', rowCount => { 
                console.log(`Parsed ${rowCount} rows`); 
                if (!hasheader) {
                    arrData.unshift([...Array(arrData[0].length)].map((_, index)=>("Attr " + index)));
                }
                res.send(JSON.stringify(arrData));
            });
        })
        .catch(err => {
            answer = 'SERVER ERROR: ' + err;
            console.log(answer);
            res.status(500).send(answer);
            return;
        })
    } catch(err) {
        throw ('Unexpected server behavior [getTaskInfo]: ' + err);
    }
});

module.exports = router;
