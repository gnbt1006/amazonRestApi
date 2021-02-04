const express =require("express");  

const { createComment,updateComment , deleteComment,getComment,getComments } = require("../controller/comments");
const { protect,authorize } = require('../middleWare/protect');


const router =express.Router();
router.route('/')
        .post(protect,authorize('user','admin','operator'),createComment)
        .get(getComments);
router
        .route('/:id')
        .get(protect,authorize('user','admin','operator'),getComment)
        .put(protect,authorize('user','admin','operator'),updateComment)
        .delete(protect,authorize('user','admin','operator'),deleteComment);

module.exports=router;
