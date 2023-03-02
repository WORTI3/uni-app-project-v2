const app = require("./app");
const http = require("http");

const port = normalisePort(process.env.PORT || "4000");
app.set("port", port);

const server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalisePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  // number
  if (port >= 0) {
    return port;
  }
  return false;
}

/**
 * Error event listener.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Listener event listener.
 */
function onListening() {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + address.port;
  console.log("App Listening on " + bind);
}

module.exports = server;
