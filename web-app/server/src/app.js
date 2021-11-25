const express = require('express');
const cors = require('cors');

const configureApp = require('./db/configureApp');

// Uploading files:
const fileUpload = require('express-fileupload'); // Simple Express middleware for uploading files
const morgan = require('morgan');

// Routes
var algsInfo = require('./routes/algsInfo');
var getTaskInfo = require('./routes/getTaskInfo');
var chooseTaskRouter = require('./routes/chooseTask');
var createTaskRouter = require('./routes/createTask');
var cancelTaskRouter = require('./routes/cancelTask');
var getSnippetRouter = require('./routes/getSnippet');

const app = express();

configureApp(app)
.then(res => {
  console.log("Application was configured succesfully");
})
.catch(err => {
  console.log("Error while configuring the application");
  process.exit(-1);
})

const jsonParser = express.json();

app.use(cors());
app.use(express.json());

// Enable file uploading
app.use(fileUpload({
  createParentPath: true
}));

app.use(morgan('dev'));

// POST requests
app.post('/chooseTask', jsonParser, chooseTaskRouter);
app.post('/createTask', jsonParser, createTaskRouter);
app.post('/cancelTask', jsonParser, cancelTaskRouter);

// GET requests
app.use('/getTaskInfo', getTaskInfo)
app.use('/algsInfo', algsInfo);
app.use('/getSnippet', getSnippetRouter);
app.use('/', (req, res) => {
  res.send('Hello World! (root route)')
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;