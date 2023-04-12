const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const authRouter = require("./auth/auth-router.js");
const usersRouter = require("./users/users-router.js");

const server = express();

server.use(helmet()); //helmet is a lot of middlewares in one, for things like security. CHECK THE HELMET DOCUMENTAITON
server.use(express.json());
server.use(cors()); //this middleware is also configuable

server.use("/api/auth", authRouter); //router plugged in
server.use("/api/users", usersRouter); //router plugged in

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
}); //error handling middleware all plugged in

module.exports = server;
