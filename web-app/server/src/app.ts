import { Application } from "express";
import { HttpError } from "http-errors";
import configureApp from "./configureApp";
import debug from "debug";
import dotenv from "dotenv";
import http from "http";

dotenv.config();

(() => {
  configureApp()
      .then(async (app) => {
        await configureServer(app);
      })
      .catch(err => {
        console.error(`App wasn't configured successfully:\n${err.message}`);
      });
})();

const configureServer = async(app: Application) => {
  const server = http.createServer(app);
  const port = app.get("port") as number;
  server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
  server.on("error", (error: HttpError) => {
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
    if (address === null) {
      throw Error("FATAL SERVER ERROR");
    }
    const bind = typeof address === "string"
        ? "pipe " + address
        : "port " + address.port;
    debug("Listening on " + bind);
  });
};
