var mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/h4r5-movies",{ useNewUrlParser: true },(err)=>{
    if(err) throw err;
    console.log("Database Connected!!");
});

var userSchema = new mongoose.Schema({
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    email:{
        type:String,
    },
    password:{
        type:String,
        minlength:8
    },
    country:{
        type:String,
    },
    likedMovies:{
        type:Array,
    },
    dislikedMovies:{
        type:Array,
    },
    myRatings:{
        type:Array,
    }

});

var movieSchema = new mongoose.Schema({
    name :{
        type:String
    },
    imageUrl :{
        type:String
    },
    review:{
        type:String
    },
    info :{
        type:String
    },
    ratings :{
        type:Object
    },
    likes :{
        type:Number
    },
    dislikes :{
        type:Number
    },
    ///posting Date
    date:{
        type:Date
    },
    ///reviewer user id
    reviewer:{
        type:String
    }
});

module.exports = {
    UserSchema:mongoose.model('users',userSchema),
    MovieSchema:mongoose.model('movies',movieSchema)
};