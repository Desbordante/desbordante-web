var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var { parse } = require ('csv-parse');

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
            const arrData = [];
            const maxRows = 100;
            const parser = parse({
                delimiter,
                to: maxRows,
                path
            });
            fs.createReadStream(datasetpath)
            .pipe(parser)
            .on('data', function(row) {
                arrData.push(row);
            })
            .on('end',function() {
                if (!hasheader) {
                    arrData.unshift([...Array(arrData[0].length)].map((_, index)=>("Attr " + index)));
                }
                console.log(JSON.stringify(arrData))
                res.send(JSON.stringify(arrData));
            })
            .on('error', function(err) {
                res.status(400).send(err);
            })
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
