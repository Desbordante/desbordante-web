import { Application } from "express";

import createTaskHandler from "./createTask"
import cancelTaskHandler from "./cancelTask"
import getTaskInfoHandler from "./getTaskInfo"
import getSnippetHandler from "./getSnippet"
import getAlgsInfoHandler from "./getAlgsInfo"

async function setEndpoints(app: Application) {
  // POST routes
  app.post("/createTask", createTaskHandler);
  app.post("/cancelTask", cancelTaskHandler);
  // GET routes
  app.get("/getTaskInfo/:taskID",getTaskInfoHandler);
  app.get("/getSnippet/:taskID", getSnippetHandler);
  app.get("/getAlgsInfo", getAlgsInfoHandler);
}

export = setEndpoints;
