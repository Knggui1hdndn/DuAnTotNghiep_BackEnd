const admin = require("../app"); // Đường dẫn tới app.js
const TokenFcm = require("../model/tokenFcm");

 

function sendNotification(registrationTokens, notification) {
  const message = {
    to: registrationTokens,
    data: {
      notification,
    },
  };
  admin
    .messaging()
    .send(registrationTokens, message)
    .then((response) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
}

module.exports = { sendNotification };
