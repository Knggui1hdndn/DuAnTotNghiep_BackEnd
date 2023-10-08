const mongoose = require('mongoose');
const bcypt = require('bcryptjs')

// Định nghĩa enum AuthType
const AuthType = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
};

// Định nghĩa enum TypeRole
const RoleType = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

const userSchema = new mongoose.Schema({
  name: String,
  avatar: String,
  email:String,
  address: [String],
  phoneNumber: String,
  password: String,
  authType: {
    type: String,
    enum: Object.values(AuthType), // Sử dụng giá trị của enum AuthType
    default: AuthType.LOCAL, // Giá trị mặc định là LOCAL
  },
  authGoogleId: String,
  roleType: {
    type: String,
    enum: Object.values(RoleType), // Sử dụng giá trị của enum TypeRole
    default: RoleType.USER, // Giá trị mặc định là USER
  },
});
userSchema.pre('save', async function (next) {
    try {
      const stal = await bcypt.genSalt(10)
      if(this.password){
        const passwordHash = await bcypt.hash(this.password, stal)
        this.password = passwordHash
      }
      next()
    } catch (error) {
      next(error)
    }
  })
  userSchema.methods.isValidatePassword = async function (newPassword) {
    try {
      return await bcypt.compare(newPassword, this.password)
    } catch (error) {
      throw new Error(error)
    }
  }
const User = mongoose.model('User', userSchema);

module.exports = User;
