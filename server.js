// Server side of simple web-page with MongoDB and Express and Socket.io

var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var express = require('express');
var fs = require("fs");
var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);
var mongoose = require("mongoose");
var _ = require("underscore");

// work with mongodb
var url = 'mongodb://' + process.env.IP;
var PhotoReview = require('./PhotoSchema');
mongoose.connect(url);
var photoReview = new PhotoReview();
//


var dataPath = "client/img/";

// serving static files
app.use(express.static(path.resolve(__dirname, 'client')));
app.use(express.bodyParser({ 
    uploadDir: 'client/img/'
}));


// connect with index.page using socket.io
io.on('connection', function(socket) {
   // create stream for reading data from MongoDB
 
   var stream = PhotoReview.find({}).stream();
   stream.on('data', function (photos) {
   socket.emit('getPhotos', photos);
});
});

// express simple routes
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/client/index.html');
});

app.get('/add', function(req, res) {
    res.sendfile(__dirname + '/client/add.html');
});

app.get('/remove', function(req, res) {
    PhotoReview.remove({}, function(err) {
        if (!err) {
         removeDirForce(dataPath, res);
            res.redirect("/");
        }
        else {
            res.redirect("/error");
        }
    });
});

app.post('/file-upload', function(req, res) {
    // get the temporary location of the file
    var tmp_path = req.files.thumbnail.path;
    // set where the file should actually exists - in this case it is in the "images" directory
    var target_path = 'client/img/' + req.files.thumbnail.name;
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
        });
    });
    photoReview = new PhotoReview({
        userName: req.body.username,
        imageName: req.body.imagename,
        imagePath: req.files.thumbnail.name
    });
    
    photoReview.save(function(err) {
        if (!err) {
            res.redirect("/");
        }
        else {
            res.redirect("/error");
        }
    });
});

app.get('/error', function(req, res) {
    res.sendfile(__dirname + '/client/error.html');
});

// run a server
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
    var addr = server.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
});

// remove all photos from directory
function removeDirForce(dirPath, res) {
  fs.readdir(dirPath, function(err, files) {
    if (err) {
        if (err) throw err;
      } else {
	    _.each(files, function(file) {
	  var filePath = dirPath + file;
	  fs.unlink(filePath, function(err) {
		  if (err) {
            res.redirect("/error");
		  }
		});
	      });
      }})};
