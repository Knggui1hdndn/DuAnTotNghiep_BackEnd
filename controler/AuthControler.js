const mongoose = require("mongoose");
const User = require("../model/user.js");
const GenerateToken = require("../middelwares/passport.js").generateToken;
const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID =
  "470422080037-a8nm0h5fs6tqo1p6p0chpv2co02jirvb.apps.googleusercontent.com";
const accountSid = "AC328a59e66a3181f40ae7d9b9777f32e5";
const authToken = "b014d6fd28d3b8ebc1512d3c1b6edd39";
const verifySid = "VA38f04e3638a7cd8bf1ad20d50bd5892d";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const twilio = require("twilio")(accountSid, authToken);

const sendOtp = async (req, res, next) => {
  console.log(req.header["Type"] )
  if (req.header("Type") === "phone") {
    sendOTPPhoneNumber(req, res, next);
  } else {
    sendOtpEmail(req, res, next);
  }
  
};
const verificaionOtp = async (req, res, next) => {
  console.log(req.header["Type"] )
  if (req.header("Type") === "phone") {
    verifyOTPPhoneNumber(req, res, next);
  } else {
    verifyOTPEmail(req, res, next);
  }
  
};
const updatePassword = async (req, res, next) => {
  const address = req.query.address;
  const newPass = req.header('newPass');
  console.log('Address:', address);
  console.log('New Password:', newPass);
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
  const user = await User.findOne({ authGoogleId: userId });
  if (user) {
    res.setHeader("Authorization", GenerateToken(user._id));
    res.status(201).json(user);
  } else {
    const newUser = new User({
      authType: "GOOGLE",
      roleType: "USER",
      name: name,
      avatar: picture,
      email: userEmail,
      authGoogleId: userId,
    });

    const userSave = await User.create(newUser);
    console.log(user);
    if (userSave) {
      res.setHeader("Authorization", GenerateToken(newUser._id));
      res.status(201).json(newUser);
    } else {
      res.status(500).json({ error: "Failed to Sign In" });
    }
  }
};

const signUpLocal = async (req, res, next) => {
  const { username, phoneNumber, password, address } = req.body;

  try {
    const existingUser = await User.findOne({ phoneNumber: phoneNumber });

    if (existingUser) {
      return res.status(400).json({ error: "Account already exists" });
    }

    const newUser = new User({
      authType: "LOCAL",
      name: username,
      address: [address],
      phoneNumber: phoneNumber,
      password: password,
      avatar: "avatar/default.jpg",
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

const sendOtpEmail = async (req, res, next) => {
  twilio.verify.v2
    .services(verifySid)
    .verifications.create({ to: "khangndph20612@fpt.edu.vn", channel: "email" })
    .then((verification) => console.log(verification.sid));
};

const sendOTPPhoneNumber = async (req, res, next) => {
  try {
    return  res.status(200).json({ message: "OTP code has been sent" });
    twilio.verify.v2
      .services(verifySid)
      .verifications.create({ to: req.query.address, channel: "sms" })
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
      res.status(404).json({ error: error  });
  }
};
const verifyOTPEmail = async (req, res, next) => {
  twilio.verify.v2
    .services(verifySid)
    .verificationChecks.create({
      to: "khangndph20612@fpt.edu.vn",
      code: "123456",
    })
    .then((verification_check) => console.log(verification_check.sid));
};
const verifyOTPPhoneNumber = async (req, res, next) => {
  return  res.status(200).json({ message: "OTP code has been sent" });

  const inputOtp = req.query.otp;
  const phoneNumber = req.body.phoneNumber;

  try {
    const verificationCheck = await twilio.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: phoneNumber, code: inputOtp });

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
  authenticationGoogle,
  verifyOTPEmail,
   sendOtp,
  verifyOTPPhoneNumber,
  updatePassword,verificaionOtp
};
