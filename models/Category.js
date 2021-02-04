const mongoose =require("mongoose");
const  { transliterate , slugify } =require("transliteration");
const  categorySchema = new mongoose.Schema({
    name :{
        type:String,
        required:[true,"Категорын нэрийг оруул"],
        unique:true,
        trim:true,
        maxlength:[50,"Категорын нэрний урт дээд тал нь 50 тэмдэгт байна."]
    },
    slug : String,
    description:{
        type:String,
        required:[true,"Категорын тайлбар оруулах ёстой"],
        maxlength:[500,"Урт нь 500 тэмдэгт байна"],
    },
    photo:{
        type:String,
        default:"no-photo.jpg",
    },
    averageRating:{
        type:Number,
        min:[1,"Rating хамгийн багадаа нэг байна"],
        max:[10,"Хамгийн ихдээ 10 байх ёстой"]
    },
    averagePrice:Number,
    createdAt:{
        type:Date,
        default:Date.now,
    }
},
{toJSON:{
    virtuals:true,

},
toObject:{
    virtuals:true,
}
});
categorySchema.virtual('books',{
    ref:'Book',
    localField:'_id',
    foreignField:'category',
    justOne:false,
});
categorySchema.pre('remove', async function(next) {
    //нэр хөрвүлэх
    console.log("removing.....");
    await this.model('Book').deleteMany({category:this._id}) 
    next();
  }); 

categorySchema.pre('save', function(next) {
  //нэр хөрвүлэх 
  this.slug = slugify(this.name);
  this.averageRating = Math.floor(Math.random()*10)+1;
// this.averagePrice = Math.floor(Math.random()*10000)+3000;
  next();
});   

 module.exports=mongoose.model("Category",categorySchema);