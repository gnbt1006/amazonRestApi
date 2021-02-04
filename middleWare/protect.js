const jwt = require ('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const Myerror = require('../utils/myerror');
const User = require('../models/User');

exports.protect = asyncHandler(async(req,res,next)=>{
    let token =null;
    if(req.headers.authorization){
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies){
        
        token= req.cookies['amazon-token'];
    }

    if(!token){
        throw new Myerror( " Энэ үйлдлийг хийхэд таны эрх хүрэхгү байна. Та Логин хийнэ үү?.Authorizarion header shalgana uu",401);
    };

    const tokenObj=  jwt.verify(token,process.env.JWT_SECRET);
  console.log(tokenObj);
 
    // req.user=await User.findById(tokenObj.id);
    req.userId =tokenObj.id;
    req.userRole =tokenObj.role;
    
    next();
});
exports.authorize = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.userRole)){
            throw new Myerror("таны эрх хүрэхгүй байнаа "+req.userRole,403);
        }
        next();
    }


}