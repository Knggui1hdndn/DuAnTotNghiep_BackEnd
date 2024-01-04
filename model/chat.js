const mongoose = require("mongoose");
// Định nghĩa schema cho class Evaluate

const chatSchema = new mongoose.Schema({
  message: {
    type: String,
    require: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Tham chiếu đến model User
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Tham chiếu đến model User
  },
  isSeen: Boolean,
  timeSend: Number,
  url: [String],
  isToUser: {
    type: Boolean,
    default: false,
  },
});

// Tạo model Evaluate
const Chat = mongoose.model("Chat", chatSchema);

module.exports =   {Chat} ;
