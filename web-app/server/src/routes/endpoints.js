const createTaskRouter = require("./createTask");
const cancelTaskRouter = require("./cancelTask");
const getTaskInfoHandler = require("./getTaskInfo");
const getAlgsInfoHandler = require("./getAlgsInfo");
const getSnippetHandler = require("./getSnippet");

const swaggerUI = require("swagger-ui-express");
const swaggerFile = require("../swagger_output.json");

const express = require("express");
const jsonParser = express.json();

module.exports = (app) => {
  // POST routes
  app.post("/createTask", jsonParser, createTaskRouter);
  app.post("/cancelTask", jsonParser, cancelTaskRouter);

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
