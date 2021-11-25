const express = require("express");
const createError = require("http-errors");
const cors = require("cors");
const configureApp = require("./db/configureApp");

// Express middleware for uploading files
const fileUpload = require("express-fileupload");
const morgan = require("morgan");

const setEndpoints = require("./routes/setEndpoints");

const app = express();

configureApp(app)
    .then(() => {
      console.debug("Application was configured successfully");
    })
    .catch((err) => {
      console.log(`Error while configuring the application ${err}`);
      throw err;
    });

app.use(cors());
app.use(express.json());

// Enable file uploading
app.use(fileUpload({
  createParentPath: true
}));

app.use(morgan("dev"));
setEndpoints(app);

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
