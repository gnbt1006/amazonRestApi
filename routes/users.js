const express =require("express");
const {protect,authorize} = require('../middleWare/protect');

const {register,
    login,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    logout,
    userPhoto,
    forgotPassword,
    resetPassword,
    createUser } = require('../controller/users');

const {getUserBooks} =require('../controller/books');
const {getUserComments}= require('../controller/comments')

const router =express.Router();

router.route('/register').post(register);
router.route('/login').post(login);


router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword').post(resetPassword);
router.route('/logout').get(logout);

router.use(protect);
router.route('/')
            .post(authorize("admin"),createUser)
            .get(authorize("admin"),getUsers);

router.route('/:id').delete(authorize("admin"),deleteUser)
            .get(authorize("admin","operator"),getUser)
            .put(authorize("admin"),updateUser);



//router.route(':id/photo').post(userPhoto);

router.route('/:id/books').get(protect,authorize("admin","user","operator"),getUserBooks);

router.route('/:id/comments').get(getUserComments);




module.exports=router;