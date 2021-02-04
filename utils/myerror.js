const { Error } = require("mongoose");

class Myerror  extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode =statusCode;
    }
}


module.exports= Myerror;