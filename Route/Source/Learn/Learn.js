var fs = require("fs");
var HttpStatus = require('http-status-codes');
var handleServerError = require("../Common/error_handler");

module.exports.getIndexJson = function (req,res) {
    fs.readFile('./public/JS/source/learn/Data/index.json', 'utf8', function (err, data) {
	    if (err){
			return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
		}
	    var obj = JSON.parse(data);
	    res.status(HttpStatus.OK).send(obj[req.query.pageName.toLowerCase()]);
	});
};

module.exports.cssprops = function (req,res) {
    fs.readFile('./public/JS/source/design/Data/cssProps.json', 'utf8', function (err, data) {
	    if (err){
			return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
		}
	    res.status(HttpStatus.OK).send(JSON.parse(data));
	});
};

module.exports.htmlElements = function (req,res) {
    fs.readFile('./public/JS/source/design/Data/HTMLElements.json', 'utf8', function (err, data) {
	    if (err){
			return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
		}
	    res.status(HttpStatus.OK).send(JSON.parse(data));
	});
};