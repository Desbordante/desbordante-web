var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    const allowedFileFormats = ["text/csv", "application/vnd.ms-excel"]
    const allowedAlgorithms = ["Pyro", "TaneX", "FastFDs", "FD mine", "DFD"];
    const allowedSeparators = [",", "\\t", "\\n", "|", ";"];
    const allowedBuiltinDatasets = [
        { datasetName: "EpicMeds.csv",      datasetSeparator: "|" }, 
        { datasetName: "WDC_age.csv",       datasetSeparator: "," },
        { datasetName: "TestLong.csv",      datasetSeparator: "," },
        { datasetName: "TestWide.csv",      datasetSeparator: "," },
        { datasetName: "breast_cancer.csv", datasetSeparator: "," }];
    const maxFileSize = 1e10;
    const algorithmsInfo = [
        { name: "Pyro",     props: { errorThreshold: true,  maxLHS: true,   threads: true  } },
        { name: "TaneX",    props: { errorThreshold: true,  maxLHS: true,   threads: false } },
        { name: "FastFDs",  props: { errorThreshold: false, maxLHS: false,  threads: true  } },
        { name: "FD mine",  props: { errorThreshold: false, maxLHS: false,  threads: false } },
        { name: "DFD",      props: { errorThreshold: false, maxLHS: false,  threads: false } }
     ]
   
    res.send(JSON.stringify({ allowedFileFormats, allowedAlgorithms, algorithmsInfo, allowedSeparators, allowedBuiltinDatasets, maxFileSize }));
});

module.exports = router;
