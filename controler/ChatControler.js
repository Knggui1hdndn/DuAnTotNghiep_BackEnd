const { Chat } = require("../model/chat.js");
const addImage = async (req, res) => {
  try {
    const uploadedFiles = req.files;
    const host = req.get("host");

    const imageLinks = uploadedFiles.map((file) => {
      return req.protocol + "://" + host + "/" + file.path;
    });
    res.status(200).json(imageLinks) ;
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getListChat = async (req, res) => {
  const idUser = req.user._id;

  const listChat = await Chat.find({
    $or: [{ sender: idUser }, { receiver: idUser }]
}).sort({ timeSend:  1 });

console.log(listChat)
res.status(200).json(listChat) ;
};
const saveChat = async (chat) => {
  try {
    const savedChat = await Chat.create({
      sender: chat.sender,
      receiver: chat.receiver,
      message: chat.message,
      isSeen: chat.isSeen || false,
      timeSend: chat.timeSend || Date.now(),
      url: chat.url || [],
      isToUser: chat.isToUser || false,
    });

    console.log("Saved Chat:", savedChat);
    return savedChat;
  } catch (error) {
    throw error;
  }
};

module.exports = { addImage, getListChat, saveChat };
