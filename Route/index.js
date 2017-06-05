var express = require("express");
var app = express();

app.get("/" , function(req,res){
	res.render("pages/main");
});

app.get("/rzSliderTpl.html" , function (req,res) {
	res.render("pages/Design/rzSlider");
});

module.exports = app;