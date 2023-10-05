const mongoose = require('mongoose');
// Định nghĩa enum TypeFeeling
const TypeFeeling = {
    HAPPY: 'HAPPY',
    SAD: 'SAD',
    LOVE: 'LOVE',
    ANGRY: 'ANGRY',
  };
// Định nghĩa schema cho class Feeling
const feelingSchema = new mongoose.Schema({
  _id: String,
  idEvaluate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evaluate', // Tham chiếu đến model Evaluate
  },
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu đến model User
  },
  type: {
    type: String,
    enum: Object.values(TypeFeeling), // Sử dụng giá trị của enum TypeFeeling
  },
});

// Tạo model Feeling
const Feeling = mongoose.model('Feeling', feelingSchema);

module.exports = Feeling;
