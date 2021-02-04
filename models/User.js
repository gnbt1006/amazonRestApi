const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto =require('crypto');
const { nextTick } = require('process');

const UserSchema= new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Хэрэглэгчийн нэрийг оруулна уу"],

    },
    email:{
        type:String,
        required:[true,"Хэрэглэгчийн майл хаягийг оруулна уу"],
        unique:true,
        match:[/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,"Майл хаягаа зөв оруулна уу?"]
    },
    role:{
    type:String,
    required:[true,"Хэрэглэгчийн эрхийг оруулна уу"],
    enum:['user','operator','admin'],
    default:'user',
    },
    password:{
        type:String,
        minlength:4,
        required:[true,"нууц үгээ оруулна уу"],
        select:false,

    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    createdAt:{
        type: Date, 
        default:Date.now,
    }
});
//save hiih bolgond ajillah pre function
UserSchema.pre('save',async function(next){
   //нууц үг өөрчоөгдөөгүй бол дараагийн мидлвейр лүү шилжинэ
    if(!this.isModified('password')){
        next();
    }
    //нууц үг өөрчлөгдсөн
    const salt =await bcrypt.genSalt(10);
    this.password= await bcrypt.hash(this.password,salt);
    
});

UserSchema.methods.getJsonWebToken = function(){
    const token = jwt.sign({id:this._id,role:this.role},process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRESIN});
        return token;
}
UserSchema.methods.checkPassword = async function(enteredPassword){
    return  await  bcrypt.compare(enteredPassword,this.password);
};
UserSchema.methods.generatePasswordChangeToken =  function(){
    const resetToken = crypto.randomBytes(30).toString("hex");

    this.resetPasswordToken= crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire =Date.now() +10*60*1000;
    console.log(resetToken);    
    return resetToken; 
};


module.exports =mongoose.model('User',UserSchema);