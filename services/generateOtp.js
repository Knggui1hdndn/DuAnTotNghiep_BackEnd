const otpGenerator  = require('otp-generator')

const generator = ()=>{
    return  otpGenerator.generate(8, { upperCaseAlphabets: false, specialChars: false });
}
module.exports={
    generator
}