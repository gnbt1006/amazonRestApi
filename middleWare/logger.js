const logger =(req,res,next)=>{

    console.log("Cookies....." , req.cookies);
    console.log(req.method,req.protocol+'://'+req.host,req.originalUrl.cyan);
    next();
};
module.exports =logger;