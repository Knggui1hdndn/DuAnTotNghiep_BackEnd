const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const LocalStrategy = require("passport-local").Strategy;
var GooglePlusTokenStrategy = require("passport-google-plus-token");
const { ExtractJwt } = require("passport-jwt");
const User = require("../model/user");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const secretKey = "khangndph20612";

const generateToken = (userID) => {
  return jwt.sign({ userID }, secretKey, { expiresIn: "60d" });
};

//giải mã token
passport.use(new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("Authorization"),
      secretOrKey: secretKey,
    },
    async (payload, done) => {
      try {
 
        const user = await User.findById(payload.userID);
         if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(null, false);
      }
    }
  )
);

 

module.exports = {
  generateToken,
};
