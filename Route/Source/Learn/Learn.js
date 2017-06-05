var fs = require("fs");

module.exports.getIndexJson = function (req,res) {
    fs.readFile('./public/JS/source/learn/Data/index.json', 'utf8', function (err, data) {
	    if (err) throw err; 
	    var obj = JSON.parse(data);
	    res.send(obj[req.query.pageName.toLowerCase()]);
	});
};

module.exports.cssprops = function (req,res) {
    fs.readFile('./public/JS/source/design/Data/cssProps.json', 'utf8', function (err, data) {
	    if (err) throw err; 
	    res.send(JSON.parse(data));
	});
};

module.exports.htmlElements = function (req,res) {
    fs.readFile('./public/JS/source/design/Data/HTMLElements.json', 'utf8', function (err, data) {
	    if (err) throw err; 
	    res.send(JSON.parse(data));
	});
};