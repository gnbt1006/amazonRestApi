const errorHandler= (err,req,res, next)=>{
    console.log(err.stack.cyan.underline);
    const error ={...err};

    console.log(err);
    error.message = err.message;

    if(error.name === 'CastError'){
        error.message = "ЭНэ Id буруу бүтэцтэй id байна.",
        error.statusCode = 400
    }


    if(error.code === 11000){
        error.message = "Талбарын утгыг давхардуулж өгч болохгүй",
        error.statusCode = 400
    }       
    res.status(error.statusCode || 500).json({
        success: false,
        error:  error,
    });
};
module.exports = errorHandler;