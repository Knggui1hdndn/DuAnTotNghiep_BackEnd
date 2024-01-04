const express = require("express");
const app = express();
const ProductController = require("./controler/ProductControler");
const http = require("http").Server(app);
const io = require("socket.io")(http);
var users = [];
const socketioJwt = require("socketio-jwt");
const ChatControler = require("./controler/ChatControler");
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connection: " + socket.id);
    const idSocket = socket.id;
    if (socket.handshake.auth.id !== null) {
      users.push({
        idUser: socket.handshake.auth.id,
        idSocket: idSocket,
      });
    } else {
      socket.join("shop");
    }

    
    socket.on("send_message", async (message) => {
      console.log(message);
      if (message.isToUser === false) {
        io.sockets.to("shop").emit("receive_message", message);
      } else {
        const targetUser = users.find((user) => user.idUser === message.idUser);
        io.sockets.to(targetUser.idSocket).emit("receive_message", message);
      }
      await ChatControler.saveChat(message);
    });


    socket.on("add_view", async (idProduct) => {
      await ProductController.addView(idProduct);
    });


    socket.on("disconnect", async () => {
      const indexToRemove = users.findIndex(
        (user) => user.idSocket === socket.id
      );

      if (indexToRemove !== -1) {
        users.splice(indexToRemove, 1);
      }
      console.log("A user disconnected: " + users.length);
    });
  });
};
