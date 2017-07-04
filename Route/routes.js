var express = require("express");
var expressValidator = require('express-validator');
var bodyParser = require("body-parser");
var app = express();
var HttpStatus = require('http-status-codes');

var Routes = require("./Routes/main");
var AuthenticateUser = require("./Source/User/Authentication");
var HandleUserProfile = require("./Source/User/HandleUserProfile");
var Learn = require("./Source/Learn/Learn");
var Design = require("./Source/Design/Design");
var AdminOPS = require("./Source/Admin/adminOps");
var fileUploadService = require('./Source/Common/fileUpload')

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());

app.get('/header', Routes.header);

app.get('/brand', Routes.brand);

app.get('/banner', Routes.banner);

app.get('/horizontalMenu', Routes.horizontalMenu);

app.get('/VerticalMenu', Routes.VerticalMenu);

app.get('/footer', Routes.footer);

app.get('/login', Routes.login);

app.get('/signUp', Routes.signUp);

app.get('/forgotCredentials', Routes.forgotCredentials);

app.get("/userProfile" , ensureAuthenticated , Routes.userProfile);

app.get('/home', ensureAuthenticated , Routes.home);

app.get('/HTML', ensureAuthenticated , Routes.HTML);

app.get('/CSS', ensureAuthenticated , Routes.CSS);

app.get('/JS', ensureAuthenticated , Routes.JS);

app.get('/designElement', ensureAuthenticated , Routes.designElement);

app.get('/designComponent', ensureAuthenticated , Routes.designComponent);

app.get('/designLayout', ensureAuthenticated , Routes.designLayout);

app.get('/about', ensureAuthenticated , Routes.about);

app.get('/query', ensureAuthenticated , Routes.query);

app.get("/resourceNotFound" , Routes.resourceNotFound);

app.get("/styleAdd" , Routes.styleAdd);

app.get('/logout', Routes.logout);

app.get("/sessionData" , Routes.sessionData);

app.get("/getUserProfile" , ensureAuthenticated , HandleUserProfile.getUserProfile);

app.post("/signUp" , AuthenticateUser.signUp);

app.post('/login', AuthenticateUser.login);

app.get('/recoverUser' , AuthenticateUser.recoverUser);

app.post('/setNewPassword' , AuthenticateUser.setNewPassword);

app.post("/updateUserProfile" , ensureAuthenticated , HandleUserProfile.updateUserProfile);

app.get("/getIndexJson" , Learn.getIndexJson);

app.get("/cssprops" , Learn.cssprops);

app.get("/htmlElements" , Learn.htmlElements);

app.get('/fileExists' , fileUploadService.fileExists);

app.post("/uploadPSDFile/:reqFileType" , Design.uploadPSDFile); // to uploadfile

// Admin operation
app.get("/viewUser" , ensureAuthenticated ,  Routes.viewUser);

app.get("/viewUserDetails/:username" , ensureAuthenticated , Routes.viewUserDetails);

app.get("/addNewUser" , ensureAuthenticated ,  Routes.addNewUser);

app.get("/getUserAccountsList" , ensureAuthenticated , AdminOPS.getUserAccountsList);

app.post("/manageAccountLock" , ensureAuthenticated , AdminOPS.manageLockAdminRight);

app.post("/importUsers/:reqFileType" , ensureAuthenticated ,  AdminOPS.importUsersList);

function ensureAuthenticated(req, res, next){
	var accountLocked = false;
	var lockedBy = "NA";
	var lockComments = "NA";
	if(req.user && req.user.opState && req.user.opState === "LOCKED"){
		lockedBy = req.user.lockedBy;
		lockComments = req.user.lockComments;
		accountLocked = true;
		req.logout();
		req.flash('success_msg', 'You are logged out');
	}
	if(req.isAuthenticated()){
		return next();
	} else {
		if(accountLocked)
			res.status(HttpStatus.UNAUTHORIZED).json({
				status:"ACCOUNT_LOCKED",
				message:"Your account has been locked permanently by "+ lockedBy +" with " + lockComments + " as comments pls contact admin to unlock your account"
			});
		else
			res.status(HttpStatus.UNAUTHORIZED).json({status:"LOGIN_REQUIRED"});
	}
}

module.exports = app;