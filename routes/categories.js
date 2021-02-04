const express =require("express");
const { getBooks } = require("../controller/books");
const { protect,authorize } = require('../middleWare/protect');

const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    categoryPhoto,
            }=require('../controller/categories');
const router =express.Router();
const {getCategoryBooks}=require('../controller/books');
router.route('/:categoryId/books').get(getCategoryBooks);

router.route('/').get(getCategories).post(protect , authorize("admin"), createCategory);
router.route('/:id/photo').put(protect,authorize("admin","operator"),categoryPhoto);
// router.route("/:categoryId/books").get(getBooks);
router
    .route('/:id')
    .get(getCategory)
    .put(protect,authorize("admin","operator"),updateCategory)
    .delete(protect,authorize("admin"),deleteCategory);

    
module.exports=router;