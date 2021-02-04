const express = require("express");
const dotenv = require('dotenv');
var path = require('path');
var morgan = require('morgan');
var rfs = require('rotating-file-stream') // version 2.x
const logger = require('./middleWare/logger');
const colors= require("colors");
const fileupload = require('express-fileupload');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require('xss-clean');
const rateLimit = require("express-rate-limit");
const hpp = require('hpp');


//route oruulj ireh
const categoriesRoutes =require("./routes/categories");
const booksRoutes =require("./routes/books");
const usersRoutes =require("./routes/users");
const commentRoutes =require("./routes/comments");
const injectDb = require('./middleWare/injectDb');
const errorHandler= require('./middleWare/error');
const connectDB = require('./config/db');

//Аппийн тохиргоог process.env rvv ачааллах
dotenv.config({ path:"./config/config.env"}); 

//MySql tei ajillah object
const db = require('./config/db-mysql');

//create Exxpress app 
const app = express();  

//connect MOngoDB database
connectDB();

// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
      interval: '1d', // rotate daily
      path: path.join(__dirname, 'log')
  });
var whiteList =["http://localhost:3000"];

var corOptions ={
    origin: function(origin,callback){
      console.log(origin);
      if(origin === undefined || whiteList.indexOf(origin) !== -1){
          //ene domianaas manai  rest server luu handahiig zuwshuurnu
          callback(null,true)
        }else{
          // ene domain handahig horiglono
          callback(new Error("horigloj baina/...."));
        }
     },
     //Клиент талаас эдгээр http header-үүдийг бичиж илгээхийг зөвшөөрнө.
     allowHeaders:"Authorization , Set-Cookie , Content-Type",
     //Клиент талаас эдгээр мессэжүүдийг  илгээхийг зөвшөөрнө.
     methods:"GET, POST, PUT ,DELETE ",
     //Клиент талаас authorization юм уу cookie  мэдээллүүдийг илгээхийг зөвшөөрнө.
     credentials:true,
   }
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 100 requests per windowMs
    message:"15 minutand 3 udaa handana",
  });

//express rate limit duudaltiin toog hyazgaarlana
app.use(limiter);
//http parametr pollution  haldlagiin esreg--> books?name=aaa&name=bbb--->name,"bbb"
app.use(hpp());
//Cookie байвал req.cookie рүү оруулж өгнө.
app.use(cookieParser());
//Бидний бичсэн логгэр 
app.use(logger);
//Body  дахь өгөгдлийг json болгоно 
app.use(express.json());
//Өөр өөр домайнтай  веб аппүүдэд хандах боломж өгнө
app.use(cors(corOptions),);
//Клиент веб аппүүд мөрдөх ёстой нууцлал хамгааллалтыг Http header  ашиглан зааж өгнө
app.use(helmet());
//Client талаас ирэх cross  site scripting халдлагаас хамгаалж өгнө
app.use(xss());
//Клиент талаас ирж буй өгөгдлийг  халдлагаас цэвэрлэнэ
app.use(mongoSanitize());
//Server лүү upload хийх  file-тай өажилллана
app.use(fileupload());
//req.db рүү Mysql Болон sequelize МОДЕЛИУДЫГ оруулна
app.use(injectDb(db));
//Morgan logger-ийн тохиргоо 
app.use(morgan('combined', { stream: accessLogStream }));
//REST API RESOURSE
app.use('/api/v1/categories',categoriesRoutes);
app.use('/api/v1/books',booksRoutes);
app.use('/api/v1/users',usersRoutes);
app.use('/api/v1/comment',commentRoutes);
//Алдаа үүсэхэд барьж авч алдааны мэдээллийг клиент тал руу илгээнэ
app.use(errorHandler);
//Sequelize моделиудын холбоог зааж өгнө.
//Ингэснээр db.user.getBooks() гэх мэтээр ажиллуулж болно.
db.user.belongsToMany(db.book,{through:db.comment});
db.book .belongsToMany(db.user,{through:db.comment});
db.user.hasMany(db.comment);
db.comment.belongsTo(db.user);

db.book.hasMany(db.comment);
db.comment.belongsTo(db.book);

  db.category.hasMany(db.book);
  db.book.belongsTo(db.category);

//Моделиудаас баазыг үүсгэнэ Үүсгээгүй бол
db.sequelize
    .sync()
    .then(result =>{
      console.log("sync hiigdlee...");
      })
    .catch((err)=>console.log("err"));
//Express server асаана
const server = app.listen(
    process.env.PORT,
    console.log('Express server '.rainbow.underline.bold+ process.env.PORT .rainbow,'deer aslaa..'.rainbow)
);
process.on('unhandledRejection',(err,promise)=>{
  console.log("aldaa garlaa",err.message);
  server.close(()=>{
    process.exit(1);
  });
});