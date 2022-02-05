require("dotenv").config();

import { Application } from "express"
import debug from "debug"
import http from "http"

import configureApp from "./configureApp"

(() => {
  // configure database, set middlewares and endpoints
  configureApp()
      .then(async (app) => {
        await configureServer(app);
      })
      .catch(err => {
        console.error(`App wasn't configured successfully:\n${err.message}`);
      })
})()

const configureServer = async(app: Application) => {
  const server = http.createServer(app);
  const port = app.get('port') as number;
  server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
  server.on("error", (error: any) => {
    if (error.syscall !== "listen") {
      throw error;
    }
    
    switch (error.code) {
      case "EACCES":
        console.error(port + " requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(port + " is already in use");
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
  server.on("listening",  () => {
    const address = server.address();
    const bind = typeof address === "string"
        ? "pipe " + address
        : "port " + address.port;
    debug("Listening on " + bind);
  });
}
