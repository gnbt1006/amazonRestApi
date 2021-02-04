const Myerror = require('../utils/myerror');
const path = require('path');
// const asyncHandler =require('../middleWare/asyncHandler');
const asyncHandler = require('express-async-handler');
const category = require('../models/Category');
const paginate = require('../utils/paginateSequelize');
const Category = require('../models/Category');
const comment = require('../models/sequelize/comment');

exports.createComment =asyncHandler(async(req,res,next)=>{ 
        const comment = await req.db.comment.create(req.body);

        res.status(200).json({
        success: true,
        data :comment,
    }); 
});

// /api/comments/:id

exports.updateComment =asyncHandler(async(req,res,next)=>{ 
    let comment = await req.db.comment.findByPk(req.params.id);

    if(!comment){
        throw new Myerror(req.params.id+"Ийм id Тай коммент олдсонгүй",400);
    }

    const comm=await comment.update(req.body);

    res.status(200).json({
    success: true,
    data :comm,
}); 
});

exports.deleteComment =asyncHandler(async(req,res,next)=>{ 
    let comment = await req.db.comment.findByPk(req.params.id);

    if(!comment){
        throw new Myerror(req.params.id+"Ийм id Тай коммент олдсонгүй",400);
    }
    await comment.destroy();

    res.status(200).json({
    success: true,
    data :comment,
}); 
});

exports.getComment =asyncHandler(async(req,res,next)=>{ 
    let comment = await req.db.comment.findByPk(req.params.id);

    if(!comment){
        throw new Myerror(req.params.id+"Ийм id Тай коммент олдсонгүй",400);
    }
    res.status(200).json({
    success: true,
    user: await comment.getUser(),
    book: await comment.getBook(),
    magic:Object.keys(req.db.comment.prototype),
    data :comment,
}); 
});

exports.getComments =asyncHandler(async(req,res,next)=>{ 

    const page = parseInt(req.query.page)|| 1; 
    const limit = parseInt(req.query.limit) || 4;
    let sort = req.query.sort;
    let select = req.query.select;
    
    if(select){
        select = select.split(' ');
    }
    
   ['select','sort','page','limit'].forEach(el =>delete req.query[el]);
        //pagination
    const pagination =await paginate(page,limit,req.db.comment);
    
    let query = {offset:pagination.start-1,limit};
     if(req.query){
         query.where= req.query;
     };

     if(select){
         query.attributes=select;
     };
     if(sort){
       query.order= sort.split(' ').map(el=>[el.charAt(0)==='-'?el.substring(1):el
        ,el.charAt(0)==='-'?"DESC":"ASC"]);
    }
    const comments = await req.db.comment.findAll(query);
    
    res.status(200).json({
        success: true,
        data : comments ,
        pagination,
        
    });
});

//lazy loading
exports.getUserComments =asyncHandler(async(req,res,next)=>{ 
    let user = await req.db.user.findByPk(req.params.id);

    if(!user){
        throw new Myerror(req.params.id+"Ийм id Тай user олдсонгүй",400);
    }
    const comm = await user.getComments();
    res.status(200).json({
    success: true,
    user,
    comments:comm,
}); 
});

//eager loader
exports.getBookComments =asyncHandler(async(req,res,next)=>{ 
    let book = await req.db.user.findByPk(req.params.id,
        {include: req.db.comment});

    if(!book){
        throw new Myerror(req.params.id+"Ийм id Тай user олдсонгүй",400);
    }
    
    res.status(200).json({
    success: true,
    book:book,
    
}); 
});


