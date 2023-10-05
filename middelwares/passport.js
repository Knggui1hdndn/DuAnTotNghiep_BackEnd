 
 const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const LocalStrategy = require('passport-local').Strategy
 var GooglePlusTokenStrategy = require('passport-google-plus-token');
const { ExtractJwt } = require('passport-jwt')
const User = require('../model/user')
const { ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken');

const secretKey = 'khangndph20612';

const generateToken = (userID) => {
  return jwt.sign({ userID }, secretKey, { expiresIn: '60d' });
};

//giải mã token
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
    secretOrKey: secretKey
}, async (payload, done) => {
    try {
         const user = await User.findById(payload.userID)
         if (!user) {
            return done(null, false)
        }
        return done(null, user)
    } catch (err) {
        return done(null, false)
    }
}
))

//passport local
passport.use(new LocalStrategy({
    usernameField: 'phoneNumber'
}, async (phoneNumber, password, done) => {
    try {
        const user = await User.findOne({ phoneNumber: phoneNumber })
 
        if (!user) {
 
            return done(  {message:'Account not found'} , false  );
        }
        
        const isCorrectPassword = await user.isValidatePassword(password);
        if (!isCorrectPassword) {
            return done({ message: 'Incorrect password' }, false  );
        }
        
        done(null, user);
        console.log(done);
    } catch (error) {
        console.log(error);
        done(error, false);
    }
}));
function customAuthenticate(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json(err);
        }
        
        if ( user) {
            req.user = user;
            next();
        } 
        // Chuyển đến middleware hoặc route handler tiếp theo
    })(req, res, next);
}
 
 
 module.exports={
    customAuthenticate,
    generateToken
 }