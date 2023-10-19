const mongoose = require('mongoose');
// Định nghĩa enum TypeFeeling
const TypeFeeling = {
    LIKE: 'LIKE',
    DISLIKE: 'DISLIKE',
 
  };
// Định nghĩa schema cho class Feeling
const feelingSchema = new mongoose.Schema({
  
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu đến model User
  },
  typeFeeling: {
    type: String,
    enum: Object.values(TypeFeeling), // Sử dụng giá trị của enum TypeFeeling
  },
});

// Tạo model Feeling
const Feeling = mongoose.model('Feeling', feelingSchema);

module.exports = Feeling;
