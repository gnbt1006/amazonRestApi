const express =require("express");
const { protect , authorize } = require('../middleWare/protect');
const {
    getBooks,
    createBook,
    deleteBook,
    updateBook,
    bookPhoto,
    getBook,
        }=require('../controller/books');
const {getBookComments}=require('../controller/comments')
        
const router =express.Router({mergeParams:true});

//api/v1/books
router.route('/').get(getBooks).post(protect,authorize("admin","operator"),createBook);

router.route('/:id').get(getBook).delete(protect,authorize("admin","operator"), deleteBook).put(protect , authorize("admin","operator"),updateBook);

router.route('/:id/upload-photo').put(protect,authorize("admin","operator"),bookPhoto);


router.route('/:id/comments').get(getBookComments);


    
module.exports=router;