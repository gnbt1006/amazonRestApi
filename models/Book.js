const mongoose =require("mongoose");
const  { transliterate , slugify } =require("transliteration");
var  bookSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Номын нэрийг оруулна уу?"],
        unique:true,
        trim:true,
        maxlength:[250,"Нэрний номын урт дээд тал нь 250 байна "]
    },
    photo:{ 
        type:String,
        default:"no-photo.jpg",
    },
    author:{
        type:String,
        required:[true,"Зохиолчын нэрийг оруулна уу?"],
        trim:true,
        maxlength:[50,"Зохиолчийн нэрний утга 50 тэмдэтэд багтана."]
    },
    rating:{
        type: Number,
        min:[1,"Хамгийн багадаа райтинг нь 1 байна."],
        max:[20,"Хамгийн ихдээ райтинг нь 15 байна.0"]
    } ,
    price:{
        type:Number,
        required:[true,"Номын үнийг оруулж өгнө үү?"],
        min:[500,"Номын үнэ хамгийн багадаа 500 төг байна"]
    },
    balance:Number,
    content:{
        type:String,
        required:[true,"Номын тайлбар оруулна уу?"],
        trim:true,
        maxlength:[5000,"Номын тайлбарын урт хамгийн ихдээ 5000 байна."]
    },
    bestseller:{
        type:Boolean,
        default:false,
    },
    avialable:[String],
    category:{
        type: mongoose.Schema.ObjectId,
        ref:'Category',
        required:true,
    },
    createUser:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
    },
    updateUser:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
    },

    createdAt:{
    type:Date,
    default:Date.now,
},
}, {
    toJSON:{
    virtuals:true,
    },
    toObject:{
        virtuals:true,
    }
});
bookSchema.statics.computeCategoryAveragePrice = async function(catId){
    const obj = await this.aggregate([
        {$match:{category:catId}},
        {$group:{_id:"$category",avgPrice:{$avg:"$price"}}},
    ]);
    console.log(obj);
    let avgPrice= null;
    if(obj.length>0){
        avgPrice = obj[0].avgPrice;
    }

  await  this.model('Category').findByIdAndUpdate(
        catId,
        { averagePrice:avgPrice,});
    return obj;   
};

bookSchema.post( "save",function(){
    this.constructor.computeCategoryAveragePrice(this.category);
});

bookSchema.post("remove", function(){
    this.constructor.computeCategoryAveragePrice(this.category);
});
bookSchema.virtual('zohiogch').get(function (){
    if(!this.author) return " ";
    let tokens =this.author.split(' ');
    if(tokens.length === 1){
        tokens =this.author.split('.');
    }
    if(tokens.length === 2 ){
        return tokens[1];
    }
    return tokens[0];
})




module.exports=mongoose.model("Book",bookSchema);