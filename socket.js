const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
 const users = [];
const socketioJwt = require("socketio-jwt");
module.exports = (io) => {
  io.on("connection", (socket) => {});

  socket.on("disconnect", () => {
    console.log("A user disconnected: " + users.length);
  });
};
