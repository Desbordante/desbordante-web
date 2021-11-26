const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./src/docs/swagger_output.json";
const endpointsFiles = ["./src/routes/setEndpoints.js"];

const doc = {
  info: {
    version: "1.0.0",
    title: "APIs Document",
    description: "Desbordante web-server docs",
  },
  host: "localhost:5000",
  basePath: "/",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      "name": "Routes",
      "description": "Endpoints"
    }
  ],
  securityDefinitions: {
    api_key: {
      type: "apiKey",
      name: "api_key",
      in: "header"
    },
    petstore_auth: {
      type: "oauth2",
      authorizationUrl: "https://petstore.swagger.io/oauth/authorize",
      flow: "implicit",
      scopes: {
        read_pets: "read your pets",
        write_pets: "modify pets in your account"
      }
    }
  },
  definitions: {
    Task: {
      phasename: "FD mining",
      progress: 100,
      currentphase: 1,
      maxphase: 1,
      status: "COMPLETED",
      filename: "TestWide.csv",
      fds: [
        {
          lhs: [0],
          rhs: 2
        },
        {
          lhs: [0],
          rhs: 4
        },
        {
          lhs: [2],
          rhs: 0
        },
        {
          lhs: [2],
          rhs: 4
        },
        {
          lhs: [4],
          rhs: 0
        },
        {
          lhs: [4],
          rhs: 2
        }
      ],
      arraynamevalue: {
        lhs: [
          {
            name: "First",
            value: 2
          },
          {
            name: "Second",
            value: 0
          },
          {
            name: "Third",
            value: 2
          },
          {
            name: "Fourth",
            value: 0
          },
          {
            name: "Fifth",
            value: 2
          }
        ],
        rhs: [
          {
            name: "First",
            value: 2
          },
          {
            name: "Second",
            value: -1
          },
          {
            name: "Third",
            value: 2
          },
          {
            name: "Fourth",
            value: -1
          },
          {
            name: "Fifth",
            value: 2
          }
        ]
      },
      columnnames: ["First", "Second", "Third", "Fourth", "Fifth"],
      pkcolumnpositions: [0, 2, 4],
      elapsedtime: "2",
      errorpercent: 0,
      maxlhs: -1,
      parallelism: 1,
      algname: "Pyro"
    },
    Snippet: [
      [
        "First",
        "Second",
        "Third"
      ],
      [
        "1",
        "2",
        "1"
      ],
      [
        "2",
        "3",
        "2"
      ],
      [
        "1",
        "2",
        "3"
      ],
      [
        "3",
        "3",
        "4"
      ],
      [
        "3",
        "4",
        "5"
      ],
      [
        "2",
        "2",
        "7"
      ],
      [
        "5",
        "2",
        "7"
      ],
      [
        "5",
        "3",
        "8"
      ]
    ],
    AlgsInfo: {
      allowedFileFormats: [
        "text/csv",
        "application/vnd.ms-excel"
      ],
      allowedAlgorithms: [
        "Pyro",
        "TaneX",
        "FastFDs",
        "FD mine",
        "DFD"
      ],
      algorithmsInfo: [
        {
          name: "Pyro",
          props: {
            errorThreshold: true,
            maxLHS: true,
            threads: true
          }
        },
        {
          name: "TaneX",
          props: {
            errorThreshold: true,
            maxLHS: true,
            threads: false
          }
        },
        {
          name: "FastFDs",
          props: {
            errorThreshold: false,
            maxLHS: false,
            threads: true
          }
        },
        {
          name: "FD mine",
          props: {
            errorThreshold: false,
            maxLHS: false,
            threads: false
          }
        },
        {
          name: "DFD",
          props: {
            errorThreshold: false,
            maxLHS: false,
            threads: false
          }
        }
      ],
      allowedSeparators: [
        ",",
        "\\t",
        "\\n",
        "|",
        ";"
      ],
      allowedBuiltinDatasets: [
        {
          datasetName: "EpicMeds.csv",
          datasetSeparator: "|",
          datasetHasHeader: true
        },
        {
          datasetName: "WDC_age.csv",
          datasetSeparator: ",",
          datasetHasHeader: true
        },
        {
          datasetName: "TestLong.csv",
          datasetSeparator: ",",
          datasetHasHeader: true
        },
        {
          datasetName: "Workshop.csv",
          datasetSeparator: ",",
          datasetHasHeader: true
        },
        {
          datasetName: "breast_cancer.csv",
          datasetSeparator: ",",
          datasetHasHeader: true
        }
      ],
      maxFileSize: 10000000000
    },
    NewTask: {
      taskID: "99c440b0-4e3d-11ec-9c6d-d92e8bc13912",
      status: "OK"
    },
    TaskConfig: {
      $algName: "Pyro",
      $separator: ",",
      $errorPercent: 0,
      $hasHeader: true,
      $maxLHS: -1,
      $parallelism: "1",
      $isBuiltinDataset: true
    }
  }
};

swaggerAutogen(outputFile, endpointsFiles, doc);
