var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var photoSchema = mongoose.Schema({
    userName: String,
    imageName: String,
    imagePath:String,
    
});

module.exports= mongoose.model('PhotoReview', photoSchema);
