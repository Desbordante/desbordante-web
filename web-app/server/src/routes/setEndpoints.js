const createTaskHandler = require("./createTask");
const cancelTaskHandler = require("./cancelTask");
const getTaskInfoHandler = require("./getTaskInfo");
const getAlgsInfoHandler = require("./getAlgsInfo");
const getSnippetHandler = require("./getSnippet");

const swaggerUI = require("swagger-ui-express");
const swaggerFile = require("../docs/swagger_output.json");

module.exports = (app) => {
  // POST routes
  app.post("/createTask", createTaskHandler);
  app.post("/cancelTask", cancelTaskHandler);

  // GET routes
  app.get("/getTaskInfo/:taskID", getTaskInfoHandler);
  app.get("/getSnippet/:taskID", getSnippetHandler);
  app.get("/getAlgsInfo", getAlgsInfoHandler);

  // Documentation
  app.use("/api", swaggerUI.serve, swaggerUI.setup(swaggerFile));

  // Home page
  app.use("/", (req, res) => {
    res.send("Root route");
  });
};
