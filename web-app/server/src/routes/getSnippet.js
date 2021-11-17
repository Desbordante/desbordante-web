var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

function bufferFile(path) {
    return fs.readFileSync(path, { encoding: 'utf8' }); // zzzz....
}
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
            const objPattern = new RegExp(
                "(\\" +
                delimiter +
                "|\\r?\\n|\\r|^)" +
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                "([^\"\\" +
                delimiter +
                "\\r\\n]*))",
                "gi",
            );
            
            let arrMatches;
            const arrData = [[]];
            var inputData = bufferFile(datasetpath);
            arrMatches = objPattern.exec(inputData);
            const maxRows = 100;
            
            while (arrMatches !== null) {
                const strMatchedDelimiter = arrMatches[1];
                if (strMatchedDelimiter.length && strMatchedDelimiter !== delimiter) {
                    if (arrData.length >= maxRows) {
                        break;
                    }
                    arrData.push([]);
                }
              
                let strMatchedValue;
              
                if (arrMatches[2]) {
                    strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
                } else {
                    strMatchedValue = arrMatches[3];
                }
                arrData[arrData.length - 1].push(strMatchedValue);
                arrMatches = objPattern.exec(inputData);
            }
            if (!hasheader) {
                arrData.unshift([...Array(arrData[0].length)].map((_, index)=>("Attr " + index)));
            }
            res.send(JSON.stringify(arrData));
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
