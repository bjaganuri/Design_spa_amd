var express = require('express');
var compression = require('compression');
var path = require('path');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var passport = require('passport');
var mongoose = require('mongoose');
var appConstants = require("./Route/Global_Const/Constants");
var index = require("./Route/index");
var route = require("./Route/routes");

var app = express();
app.use(compression());

var dbURI = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || appConstants.initServerData.dbURI;
var port =process.env.PORT || appConstants.initServerData.port;
mongoose.connect(dbURI, function (err, res) {
	if (err) {
		console.log ('ERROR connecting to: ' + dbURI + '. ' + err);
	} else {
		console.log ('Succeeded connected to: ' + dbURI);
	}
});

// When successfully connected
mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    console.log('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
});

var store = new MongoDBStore({
	uri: dbURI,
	collection: 'sessions'
});

store.on('error', function(error) {
	console.log(error);
});
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname , 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
	store: store,
    secret: 'secret',
    saveUninitialized: false,
    resave: false,
    cookie:{
    	maxAge:1000*60*60*2
    },
    rolling : true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

app.use(function(req,res,next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

app.use(expressValidator({
  	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.')
		, root    = namespace.shift()
		, formParam = root;

	    while(namespace.length) {
	      	formParam += '[' + namespace.shift() + ']';
	    }
	    return {
			param : formParam,
			msg   : msg,
			value : value
	    };
  	}
}));

app.use(index);
app.use("/users" , route);

app.use(function(req,res,next){
	res.render(__dirname+"/views/pages/main");
	next();
});

var server = app.listen(port, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log("Example app listening at http://%s:%s", host, port);
});