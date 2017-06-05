var mongoose = require('mongoose');
var assert = require('assert');
var Grid = require('gridfs-stream');
var fs = require('fs');
var ObjectID = require('mongodb').ObjectID;

var GridFS = undefined;
mongoose.connection.on('open', function callback () {
    GridFS = Grid(mongoose.connection.db, mongoose.mongo);
});

module.exports.writeFileToDB = function (file,user,comments,callback) {
    var writestream = GridFS.createWriteStream({
        filename: file.originalname,
        mode:'w',
        chunkSize: 1024,
        content_type: file.mimetype,
        //root: 'ImageCollection',
        metadata:{
            owner_id: ObjectID(user['_id']),
            comments:comments
        }
    });
    writestream.on('close', function (file) {
        callback(null, file);
    });
    fs.createReadStream(file.path).pipe(writestream);
};

module.exports.fileExists = function (query,callback) {
    GridFS.files.find(query).toArray(callback);
};

module.exports.removeExisting = function (query,callback) {
    GridFS.remove(query,callback);
};

module.exports.readFileFromDB = function (fileName , callback) {
    try {
        return GridFS.createReadStream({filename: fileName});
    } 
    catch (err) {
       assert.ifError(err);
        return callback("File Not Found");
    }
};