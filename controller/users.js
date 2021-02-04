let User = require('../models/User');
const Myerror = require('../utils/myerror');
const path = require('path');
const paginate = require('../utils/paginate');
const asyncHandler = require('express-async-handler');
const { query } = require('express');
const sendMail= require('../utils/email');
const crypto = require('crypto');


//register hiih
exports.register = asyncHandler(async(req,res,next)=>{

    const user = await User.create(req.body);

    const token =user.getJsonWebToken();

    console.log("bvrtgegdlee")
        res.status(200).json({
        success: true, 
        token,
        data:user,
    }); 
});
exports.login = asyncHandler(async(req,res,next)=>{

    //оролтыг шалгана

    const {email,password}=req.body;
    if(!email || !password) {
        throw new Myerror('Имайл болон нууц үгээ дамжуулна уу',400);
    }
    //тухайн хэрэглэгчийн хайна

   const user = await User.findOne({email:email}).select("+password");
    
    if(!user){
        throw new Myerror("Email болон нууц үгээ зөв оруулна уу",401);
    };

    //NUUTS UG SHALGAH
    const ok = await user.checkPassword(password);

    if(!ok){
        throw new Myerror("Email болон нууц үгээ зөв оруулна уу",401);
    }

    const  token = user.getJsonWebToken();
    const cookieOption = {
        expires:new Date(Date.now() +   30 * 24 *60 * 60 * 1000),
        httpOnly:true,
    }
    console.log("Newterlee");
        res.status(200).cookie('amazon-token',token, cookieOption).json({
        success: true, 
        token,
        data:user,
    }); 
});
exports.logout = asyncHandler(async(req,res,next)=>{

    
    const cookieOption = {
        expires:new Date(Date.now() - 365 * 24 *60 * 60 * 1000),
        httpOnly:true,
    }
        res.status(200).cookie('amazon-token',null, cookieOption).json({
        success: true, 
        data:"Logged out",
    }); 
});

exports.getUsers =asyncHandler( async(req,res,next)=>{
    
    const page = parseInt(req.query.page)|| 1; 
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort;
    const select = req.query.select;
   ['select','sort','page','limit'].forEach(el =>delete req.query[el]);
        //pagination
    const pagination =await paginate(page,limit,User);
    
    const user = await User.find(req.query,select)
        .sort(sort)
        .skip(pagination.start-1)
        .limit(limit);
    
    res.status(200).json({
        success: true,
        data : user,
        pagination,
    });
});

exports.getUser =asyncHandler( async(req,res,next)=>{
    
    const user=await User.findById(req.params.id);
    if(!user)
    {
        throw new Myerror(req.params.id +"  id -тай хэрэглэгч байхгүй байна",400);
    }
    res.status(200).json({
        success: true,
        data : user,
    });  
});
exports.createUser =asyncHandler(async(req,res,next)=>{
    console.log("data",req.body); 
        const user = await User.create(req.body);
        res.status(200).json({
        success: true,
        data :user,
    }); 
});


exports.updateUser =asyncHandler( async (req,res,next)=>{
        const user = await User.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true,

        });
        if(!user){
            throw new Myerror(req.params.id+"id тай хэрэглэгч байхгүй байна",404);
        }
        res.status(200).json({
            success: true,
            data : user,
            }); 
});
exports.deleteUser =asyncHandler( async (req,res,next)=>{
    
    const user = await User.findById(req.params.id);
    if(!user){
       throw new Myerror(req.params.id+"id тай хэрэглэгч байхгүй байна",404);
    }
    user.remove();

    res.status(200).json({
        success: true,
        data : user,
        }); 
});

exports.userPhoto = asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    console.log(req.params.id);
    if(!user){
        throw new Myerror(req.params.id +"id тай хэрэглэгч алга байна");
    }   
    //categors-iin zurag upload hiih code
    const file = req.files.file;
    if(!req.files.file.mimetype.startsWith('image')){
        throw new Myerror("Та зураг upload хийнэ үү",404);
    }
    if(req.files.file.size > process.env.MAX_UPLOAD_FILE_SIZE){
        throw new Myerror("Таны  зурагны хэмжээ хэтэрсэн байна ",404);
    }
   file.name="photo_"+req.params.id +path.parse(file.name).ext;
   console.log(file.name);

   file.mv(process.env.FILE_UPLOAD_PATH+"/"+file.name,err=>{
       if(err){
        throw new Myerror("Файлыг хуулах явцад алдаа гарлаа.Алдаа:", 400);
        }

        user.photo= file.name;
        user.save();
        res.status(200).json({
            success:true,
            data:file.name,
        })
     } );
});
//password sergeeh api
exports.forgotPassword =asyncHandler( async (req,res,next)=>{
    if(!req.body.email){
        throw new Myerror("Нууц үг сэргээх email хаягаа оруулна уу?",400);
    }
    const user = await User.findOne({email:req.body.email});
    if(!user){
       throw new Myerror(req.body.email+"email тай хэрэглэгч байхгүй байна",404);
    }
    const resetToken= user.generatePasswordChangeToken();
    await user.save();
    // await  user.save({validateBeforeSave:false});

    //email ilgeene
    const link= 'https://amazon.mn/changePassword/'+resetToken;

    const message= 'Сайн байна уу<br><br>Та  нууц үгээ сэргээхийн тулд доорх линк дээр дарж солино уу?<br><a target="_blanks" href="'+link+'">'+link+'</a>';
    
    await sendMail({
        email:user.email,
        subject:'Нууц үг өөрчлөх хүсэлт',
        message,
    });

    res.status(200).json({
        success: true,
        resetToken,
        }); 
});

exports.resetPassword =asyncHandler( async (req,res,next)=>{
    if(!req.body.resetToken || !req.body.password){
        throw new Myerror("Та token болон нууц үгээ дамжуулна уу?",400);
    }

    const encrypted = crypto
            .createHash('Sha256')
            .update(req.body.resetToken)
            .digest('hex');

    const user = await User.findOne({
            resetPasswordToken:encrypted,
            resetPasswordExpire:{$gt:Date.now()}});

    if(!user){
       throw new Myerror("Token хүчингүй  байна",404);
    }

    user.password = req.body.password;
    user.resetPasswordToken =undefined;
    user.resetPasswordExpire= undefined;
    
    await user.save();

    const token = user.getJsonWebToken();

    res.status(200).json({
        success: true,
        token,
        user:user,
        }); 
});

