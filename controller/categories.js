const Myerror = require('../utils/myerror');
const path = require('path');
// const asyncHandler =require('../middleWare/asyncHandler');
const asyncHandler = require('express-async-handler');
const category = require('../models/Category');
const paginate = require('../utils/paginate');
const Category = require('../models/Category');
exports.getCategories =asyncHandler( async(req,res,next)=>{
    
    const page = parseInt(req.query.page)|| 1; 
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort;
    const select = req.query.select;
   ['select','sort','page','limit'].forEach(el =>delete req.query[el]);
        //pagination
    const pagination =await paginate(page,limit,Category);
    
    const categories = await category.find(req.query,select)
        .sort(sort)
        .skip(pagination.start-1)
        .limit(limit);
    
    res.status(200).json({
        success: true,
        data : categories,
        pagination,
    });
});

exports.getCategory =asyncHandler( async(req,res,next)=>{
    
    req.db.teacher.create({
        id:1,
        name:'ganbat',
        phone:'90662777',
        password:'123456',
    });
    req.db.course.create({
        id:1,
        name:'C ++',
        price:'9000',
        tailbar:'aejnaeiunijfhf',
    })
    const category2=await category.findById(req.params.id).populate('books');
    if(!category2)
    {
        throw new Myerror(req.params.id +"  id -тай  категори байхгүй байна",400);
    }
    res.status(200).json({
        success: true,
        data : category2,
    });  
});
exports.createCategory =asyncHandler(async(req,res,next)=>{
    console.log("data",req.body); 
        const category1 = await category.create(req.body);
        res.status(200).json({
        success: true,
        data :category1,
    }); 
});

exports.updateCategory =asyncHandler( async (req,res,next)=>{
        const category3 = await category.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true,

        });
        if(!category3){
            return res.status(400).json({
                success:false,
                error:req.params.id+"ID тай хэрэглэгч байхгүй."
            });
        }
        res.status(200).json({
            success: true,
            data : category3,
            }); 
});
exports.deleteCategory =asyncHandler( async (req,res,next)=>{
    
    const category3 = await category.findById(req.params.id);
    if(!category3){
        return res.status(400).json({
            success:false,
            error:req.params.id+"ID тай хэрэглэгч байхгүй."
        });
    }
    category3.remove();

    res.status(200).json({
        success: true,
        data : category3,
        }); 
});

exports.categoryPhoto = asyncHandler(async(req,res,next)=>{
    const category1 = await category.findById(req.params.id);
    console.log(req.params.id);
    if(!category1){
        throw new Myerror(req.params.id +"id тай category алга байна");
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

        category1.photo= file.name;
        category1.save();
        res.status(200).json({
            success:true,
            data:file.name,
        })
     } );
   
});