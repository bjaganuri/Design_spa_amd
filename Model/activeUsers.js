var mongoose = require('mongoose');
var assert = require('assert');
// mongoose.connect('mongodb://bbj:bbj@ds159208.mlab.com:59208/bjaganuri');
// var db = mongoose.connection;
var DB = undefined;
var sessionCollection = undefined;

mongoose.connection.on('open', function callback () {
    DB = mongoose.connection;
    DB.db.collection("sessions" , function (err,collection) {
        assert.ifError(err);
        if(collection != undefined){
            sessionCollection = collection;
        }
    });
});

module.exports.removeActiveSession = function (query , callback) {
    if(sessionCollection != undefined){
        sessionCollection.remove(query ,callback);
    }
};