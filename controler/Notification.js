const admin = require("../app"); // Đường dẫn tới app.js
const TokenFcm = require("../model/tokenFcm");
const Notification = require("../model/notification");

const getNotification = async (req, res) => {
  try {
    const notifications = await Notification.find({ idReceve: req.user._id });
    res.status(200).send(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const updateNotification = async (req, res) => {
  try {
    const notifications = await Notification.findOneAndUpdate(
      { _id: req.query._id },
      { isSeen: true },
      { new: true }
    );

    if (notifications) {
      res.status(200).send(notifications);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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

module.exports = { sendNotification, getNotification, updateNotification };
