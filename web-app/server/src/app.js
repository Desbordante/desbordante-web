const express = require("express");
const createError = require("http-errors");
const cors = require("cors");
const configureApp = require("./db/configureApp");

// Uploading files:
// Simple Express middleware for uploading files
const fileUpload = require("express-fileupload");
const morgan = require("morgan");

// Routes
const algsInfo = require("./routes/algsInfo");
const getTaskInfo = require("./routes/getTaskInfo");
const createTaskRouter = require("./routes/createTask");
const cancelTaskRouter = require("./routes/cancelTask");
const getSnippetRouter = require("./routes/getSnippet");

const app = express();

configureApp(app)
    .then(() => {
      console.debug("Application was configured succesfully");
    })
    .catch((err) => {
      console.log(`Error while configuring the application ${err}`);
      throw err;
    });

const jsonParser = express.json();

// TODO
app.use(cors());
app.use(express.json());

// Enable file uploading
app.use(fileUpload({
  createParentPath: true
}));

app.use(morgan("dev"));

// POST requests
app.post("/createTask", jsonParser, createTaskRouter);
app.post("/cancelTask", jsonParser, cancelTaskRouter);

// GET requests
app.use("/getTaskInfo", getTaskInfo);
app.use("/algsInfo", algsInfo);
app.use("/getSnippet", getSnippetRouter);
app.use("/", (req, res) => {
  res.send("Hello World! (root route)");
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
