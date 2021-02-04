let Book = require('../models/Book');
const Category = require('../models/Category');
const Myerror = require('../utils/myerror');
const path = require('path');
const asyncHandler = require('express-async-handler');
const { query } = require('express');
const { findByIdAndUpdate } = require('../models/Category');
const paginate = require('../utils/paginate');
const User = require('../models/User');

//api/v1/books

exports.getBooks= asyncHandler(async( req,res,next)=>{
   
    console.log("------------",req.query.name);
    const page = parseInt(req.query.page)|| 1; 
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort;
    const select = req.query.select;
   ['select','sort','page','limit'].forEach(el =>delete req.query[el]);
    const pagination = await paginate(page,limit ,Book);

    const books = await Book.find(req.query,select).populate({
        path:"category",
        select:"name averagePrice",
    }).sort(sort)
    .skip(pagination.start-1)
    .limit(limit);;

    res.status(200).json({
        count: books.length,
        success:true,
        data:books,
        pagination,
    })
});

exports.getUserBooks= asyncHandler(async( req,res,next)=>{
   
    const page = parseInt(req.query.page)|| 1; 
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort;
    const select = req.query.select;
   ['select','sort','page','limit'].forEach(el =>delete req.query[el]);
    const pagination = await paginate(page,limit ,Book);
    
    req.query.createUser = req.userId;
    console.log(req.query);

    const books = await Book.find(req.query,select).populate({
        path:"category",
        select:"name averagePrice",
    }).sort(sort)
    .skip(pagination.start-1)
    .limit(limit);;

    res.status(200).json({
        count: books.length,
        success:true,
        data:books,
        pagination,
    })
});
//api/v1/categoties/cat-id/books
exports.getCategoryBooks= asyncHandler(async( req,res,next)=>{
    const page = parseInt(req.query.page)|| 1; 
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort;
    const select = req.query.select;
   ['select','sort','page','limit'].forEach(el =>delete req.query[el]);
    const pagination = await paginate(page,limit ,Book);
    const books = await Book.find({...req.query,category:req.params.categoryId},select,)
    .sort(sort)
    .skip(pagination.start-1)
    .limit(limit);

    res.status(200).json({
        count: books.length,
        success:true,
        data:books,
        pagination,
    })
});
//Нэг номыг авах API
exports.getBook= asyncHandler(async( req,res,next)=>{

    const book = await Book.findById(req.params.id);
    console.log("awlaa");
    if(!book){
        throw new Myerror(req.params.id + "тай ном байхгүй байнаа",404);
    }
    res.status(200).json({
        success:true,
        data:book  
    });
});

//Номны мэдээлл оруулах
exports.createBook =asyncHandler (async(req,res,next)=>{

    const category  =await Category.findById(req.body.category);

    if(!category)
    {
        throw new Myerror(req.body.category +"  id -тай  категори байхгүй байна",400);
    }
    req.body.createUser =req.userId;

    const book = await Book.create(req.body,);

    res.status(200).json({
        success:true,
        data:book,
    })
 });
exports.deleteBook = asyncHandler(async(req,res,next)=>{

    const book = await Book.findById(req.params.id);

    if(!book){
        throw new Myerror(req.params.id+ "Id тай ном байхгүй байна.",404);
    }
 console.log(req.userId);
    if(!book.createUser.toString()!==req.userId && req.userRole !== 'admin'){
        throw new Myerror("Та зөвхөн өөрийнхөөө номыг засварлах боломжтой.  ",403)
    }
    
    //Номын мэдээллийг ямар хэрэглэгч устгасан гэдгийг токений Id ашиглан бааазаас шүүж байна.
    const user = await User.findById(req.userId);
    book.remove();
     res.status(200).json({
        success:true,
        data:book,
        deletedBy:user.name,
     });
});

exports.updateBook = asyncHandler(async(req,res,next)=>{


    console.log("changed....");
   
    
    const book = await Book.findById(req.params.id);

    if(!book){
        throw new Myerror(req.params.id +"id тай ном байхгүй байна");
    }   

    if(!book.createUser.toString()!==req.userId && req.userRole !== 'admin'){
        throw new Myerror("Та зөвхөн өөрийнхөөө номыг засварлах боломжтой.  ",403)
    }
    req.body.updateUser=req.userId;

    for(let attr in req.body){
        book[attr]=req.body[attr];
    }
    book.save();

    res.status(200).json({
        success: true,
        data : book,

        }); 
});

//  PUT  pai/v1/books/:id/photo
exports.bookPhoto = asyncHandler(async(req,res,next)=>{
    const book = await Book.findById(req.params.id);

    if(!book){
        throw new Myerror(req.params.id +"id тай ном байхгүй байна");
    }   
    //upload hiih code
    const file = req.files.file;
    if(!req.files.file.mimetype.startsWith('image')){
        throw new Myerror("Та зурагupload хийнэүү",404);
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

        book.photo= file.name;
        book.save();
        res.status(200).json({
            success:true,
            data:file.name,
        })
     } );
   
});