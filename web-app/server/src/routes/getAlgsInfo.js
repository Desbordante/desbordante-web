// #swagger.tags = ['getTaskInfo']
// #swagger.description = 'Endpoint for getting task info.'
const getAlgsInfoHandler = (req, res) => {
  const allowedFileFormats = ["text/csv", "application/vnd.ms-excel"];
  const allowedAlgorithms = ["Pyro", "TaneX", "FastFDs", "FD mine", "DFD"];
  const allowedSeparators = [",", "\\t", "\\n", "|", ";"];
  const allowedBuiltinDatasets = [
    { datasetName: "EpicMeds.csv", datasetSeparator: "|", datasetHasHeader: true },
    { datasetName: "WDC_age.csv", datasetSeparator: ",", datasetHasHeader: true },
    { datasetName: "TestLong.csv", datasetSeparator: ",", datasetHasHeader: true },
    { datasetName: "Workshop.csv", datasetSeparator: ",", datasetHasHeader: true },
    { datasetName: "breast_cancer.csv", datasetSeparator: ",", datasetHasHeader: true }];
  const maxFileSize = 1e10;
  const algorithmsInfo = [
    { name: "Pyro", props: { errorThreshold: true, maxLHS: true, threads: true } },
    { name: "TaneX", props: { errorThreshold: true, maxLHS: true, threads: false } },
    { name: "FastFDs", props: { errorThreshold: false, maxLHS: false, threads: true } },
    { name: "FD mine", props: { errorThreshold: false, maxLHS: false, threads: false } },
    { name: "DFD", props: { errorThreshold: false, maxLHS: false, threads: false } }
  ];
  /* #swagger.responses[200] = {
               schema: { $ref: "#/definitions/AlgsInfo" },
               description: 'Information about algorithms configuration.'
  } */
  res.json({
    allowedFileFormats, allowedAlgorithms, algorithmsInfo,
    allowedSeparators, allowedBuiltinDatasets, maxFileSize
  });
};

module.exports = getAlgsInfoHandler;
