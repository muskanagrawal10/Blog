//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const favicon = require("express-favicon");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
// require("dotenv/config");
//------------------------------------------------------------------
const app = express();
mongoose.connect("mongodb+srv://admin-muskan:muskan1998@blogcluster.0k672.mongodb.net/blogDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("./public"));

app.use(favicon(__dirname + "/public/favicon/favicon.ico"));
//------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));     //We put null cz we dont want any error. Date.now() for current time. extname for extension of thw file being uploaded.
  }
});
const upload = multer({
  storage: storage
}).single('image');

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  imageName: String,
  commentBox: [{name: String,comment: String}]
});



const Post = mongoose.model("Post", blogSchema);

app.get("/", function(req,res){
  Post.find({}, function(err, foundPosts){
    if(err)
    {
      console.log(err);
    }
    else{
      res.render("home", {postarr: foundPosts});
    }
  });
});

app.get("/aboutme", function(req,res){
  res.render("about");
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", upload, function(req, res){

    // console.log(req.file);
    const newPost = new Post({
      title: req.body.newTitle,
      content: req.body.newContent,
      imageName: req.file.filename

    });

    newPost.save();

  res.redirect("/");
});

app.get("/posts/:poemID", function(req,res){

var x = req.params.poemID;

Post.findOne({_id: x}, function(err, post){

    res.render("post", {title: post.title, content: post.content, imageName: post.imageName, postID: post._id, comments: post.commentBox});

});
});


app.post("/posts/:poemID", function(req, res){
  var poemID = req.params.poemID;
  var _Name = req.body.Name;
  var comment = req.body.Comment;


//  else{
    if(_Name.length===0)
    {
      _Name= "~Unknown~";
    }
  var newComment = {name: _Name, comment: req.body.Comment};
  console.log(newComment);
  Post.updateOne({_id: poemID}, {$push: {commentBox: newComment}}, function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Successfully Updated!");
    }
  });

  res.redirect("/posts/" + poemID);

});
// Post.deleteMany({title: "abcd"}, function(err){
//   if(err)
//   {
//     console.log(err);
//   }
//   else{
//     console.log("Successfully deleted");
//   }
// });
app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
