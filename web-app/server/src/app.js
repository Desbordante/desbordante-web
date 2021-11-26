const cors = require("cors");
const createError = require("http-errors");
const express = require("express");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");

const configureApp = require("./db/configureApp");
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

// Add middlewares
app.use(cors());
app.use(fileUpload({
  createParentPath: true
}));
app.use(morgan("dev"));

// Add routes (endpoints)
setEndpoints(app);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
