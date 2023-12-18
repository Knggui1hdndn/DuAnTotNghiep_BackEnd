const mongoose = require("mongoose");
const User = require("../model/user.js");
const TokenFcm = require("../model/tokenFcm.js");
const GenerateToken = require("../middelwares/passport.js").generateToken;
const { OAuth2Client } = require("google-auth-library");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const SendEmail = require("../services/sendEmail.js");
dotenv.config();
const GOOGLE_CLIENT_ID =
  "470422080037-a8nm0h5fs6tqo1p6p0chpv2co02jirvb.apps.googleusercontent.com";
  const accountSid = "ACa6de830808fa1f3989a8140b87937031";
  const authToken =  "b54bbcf64721a2ab61c04bd185e80952";
  const verifySid = "VA999c76ae3c784af8d499962020be0754";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const twilio = require("twilio")(accountSid, authToken);

const sendOtp = async (req, res, next) => {
  const { email, account, type } = req.body;
  console.log("saaaaaaaaaaaaa" + account);
  if (type === "phone") {
    sendOTPPhoneNumber(account, res);
  } else {
    SendEmail.sendOtpEmail(account, res);
  }
};
const verificaionOtp = async (req, res, next) => {
  const { otp, email, account, type } = req.body;
  if (type === "phone") {
    verifyOTPPhoneNumber(account, otp, res);
  } else {
    SendEmail.verifyOTPEmail(account, otp, res);
  }
};
const updatePassword = async (req, res, next) => {
  const address = req.query.address;
  const newPass = req.header("newPass");
  console.log("Address:", address);
  console.log("New Password:", newPass);

  try {
    // Tìm người dùng bằng số điện thoại hoặc email
    const user = await User.findOne({
      $or: [{ phoneNumber: address }, { email: address }],
    });

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    user.password = newPass;
    await user.save();

    return res
      .status(200)
      .json({ message: "Mật khẩu đã được cập nhật thành công." });
  } catch (error) {
    console.error("Lỗi khi cập nhật mật khẩu:", error);
    return res.status(500).json({ message: "Lỗi khi cập nhật mật khẩu." });
  }
};

const authenticationGoogle = async (req, res, next) => {
  const idToken = req.header("Authorization_Google");
  const { userId, userEmail, picture, name } = await verifyGoogleToken(idToken);
  var roleType = req.query.roleType;

  if (roleType) {
    roleType = "ADMIN";
  } else {
    roleType = "USER";
  }
  const user = await User.findOne({ authGoogleId: userId, roleType: roleType });

  if (user) {
    await TokenFcm.findOneAndUpdate(
      { idUser: user._id },
      { idUser: user._id, token: req.header("Fcm") },
      { upsert: true }
    );
    res.setHeader("Authorization", GenerateToken(user._id));
    res.status(201).json(user);
  } else {
    const newUser = new User({
      authType: "GOOGLE",
      roleType: roleType,
      name: name,
      avatar: picture,
      email: userEmail,
      authGoogleId: userId,
    });

    const userSave = await User.create(newUser);
    console.log(user);
    if (userSave) {
      await TokenFcm.findOneAndUpdate(
        { idUser: userSave._id },
        { idUser: userSave._id, token: req.header("Fcm") },
        { upsert: true }
      );
      res.setHeader("Authorization", GenerateToken(newUser._id));
      res.status(201).json(newUser);
    } else {
      res.status(500).json({ error: "Failed to Sign In" });
    }
  }
};

const signUpLocal = async (req, res, next) => {
  const { username, phoneNumber, password, address } = req.body;
  var roleType = req.query.roleType;

  if (roleType) {
    roleType = "ADMIN";
  } else {
    roleType = "USER";
  }
  try {
    const existingUser = await User.findOne({
      phoneNumber: phoneNumber,
      roleType: roleType,
    });

    if (existingUser) {
      return res.status(400).json({ error: "Account already exists" });
    }

    const newUser = new User({
      authType: "LOCAL",
      name: username,
      address: address,
      phoneNumber: phoneNumber,
      password: password,
      roleType: roleType,
      avatar:
        "https://gocsuckhoe.com/wp-content/uploads/2020/09/avatar-facebook.jpg",
    });

    const userSave = await User.create(newUser);

    if (userSave) {
      const token = GenerateToken(userSave._id);
      res.setHeader("Authorization", token);
      return res.status(201).json(userSave);
    } else {
      console.log("Failed to Sign Up");
      return res.status(500).json({ error: "Failed to Sign Up" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const LoginUser = async (req, res) => {
  const email = req.body.account;
  const password = req.body.password;
  var roleType = req.query.roleType;
  if (roleType) {
    roleType = "ADMIN";
  } else {
    roleType = "USER";
  }
  try {
    const user = await User.findOne({
      $or: [{ email: email }, { phoneNumber: email }],roleType:roleType });
       console.log(roleType +"  "+email);
    if (!user) {
      res.status(400).json({ error: "Account không hợp lệ" });
    } else {
      if(user.status===false){
     return   res.status(400).json({ error: "Tài khoản của bạn đã bị khóa" });
      }
      await TokenFcm.findOneAndUpdate(
        { idUser: user._id },
        { idUser: user._id, token: req.header("Fcm") },
        { upsert: true }
      );
      //  const validate =await user.isValidatePassword(password);
      // if (validate) {
      const token = GenerateToken(user._id);
      res.setHeader("Authorization", token);
      console.log(user);
      res.status(200).send(user);
      // } else {
      //   res.status(400).json({ error: "Account không hợp lệ" });
      // }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID, // Điều chỉnh audience theo client ID của bạn
    });
 
    const payload = ticket.getPayload();
    const userId = payload.sub;
    const picture = payload.picture;
    const userEmail = payload.email;
    const name = payload.name;
    console.error(
      "Xác thực token Google thất bại:",
      userId,
      userEmail,
      picture,
      name
    );
    return { userId, userEmail, picture, name };
  } catch (error) {
    console.error("Xác thực token Google thất bại:", error);
    return null;
  }
};

const sendOTPPhoneNumber = async (phoneNumber, res) => {
  try {
    twilio.verify.v2
      .services(verifySid)
      .verifications.create({ to: phoneNumber, channel: "sms" })
      .then((verification) => {
        console.log(verification.status);
        res.status(200).json({ message: "OTP code has been sent" });
      })
      .catch((error) => {
        console.error("oksokda" + error.message);
        return res.status(404).json({ error: error.message });
      });
  } catch (error) {
    console.error("oksokda" + error);
    res.status(404).json({ error: error.message });
  }
};

const verifyOTPPhoneNumber = async (phoneNumber, otp, res) => {
  return res.status(200).json({ message: "OTP code has been sent" });
  try {
    const verificationCheck = await twilio.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: phoneNumber, code: otp });

    if (verificationCheck.status === "approved") {
      next();
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.log("ssss" + error.message);
    res.status(500).json({ error: "Error :" + error.message });
  }
};
module.exports = {
  signUpLocal,
  LoginUser,
  authenticationGoogle,
  sendOtp,
  verifyOTPPhoneNumber,
  updatePassword,
  verificaionOtp,
  LoginUser,
};
