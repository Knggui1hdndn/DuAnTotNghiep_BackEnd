const otpGenerator  = require('otp-generator')

const generator = ()=>{
    const otp=   otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
   
     
    return otp 
}

module.exports={
    generator
}