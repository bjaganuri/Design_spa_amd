var User = require("../../../Model/users");
var HttpStatus = require('http-status-codes');
var handleServerError = require("../Common/error_handler");

module.exports.getUserProfile = function (req,res) {
	var query = {};
	if(req.query && (req.query.username || req.query.email)){
		for(key in req.query){
			query[key] = req.query[key]
		}
	}
	else{
		query = {username:req.user.username , email:req.user.email , name:req.user.name};
	}
    User.getUserProfile(query , function(err,user){
		if(err){
			return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
		}
		var resObj = {};
		if(user){		
			resObj = user.toObject();
			resObj.exists = true;
			resObj["ownProfile"] = false;
			if(resObj.username === req.user.username){
				resObj["ownProfile"] = true;
			}
		}
		else{
			resObj.exists = false;
		}
		res.status(HttpStatus.OK).send(JSON.stringify(resObj));
	});
};

module.exports.updateUserProfile = function (req, res, next) {
    var name = req.body.name;
	var email = req.body.email;
	var altEmail = req.body.altEmail;
	var dob = req.body.dob;
	var altMobile = req.body.altMobile;
	var mobile = req.body.mobile;
	var username = req.body.username;
	var password = req.body.password;

	req.checkBody('name' , 'Name is required').notEmpty();
	req.checkBody('dob' , 'Email is required').notEmpty();
	req.checkBody('email' , 'Email is required').notEmpty();
	req.checkBody('email' , 'Invalid Email').isEmail();
	req.checkBody('mobile' , 'Phone No. is required').notEmpty();
	req.checkBody('username' , 'Username is required').notEmpty();
	if(altEmail){
		req.checkBody('altEmail' , 'Invalid Altername Email').isEmail();
	}
	if(altMobile){
		req.checkBody('altMobile' , 'Invalid alternate phone number').notEmpty();
	}
	if(password){
		req.checkBody('password' , 'Password is required').notEmpty();
		req.checkBody('cpassword' , 'Both password do not match').equals(req.body.password);
	}

	req.getValidationResult().then(function(result){
		if(result.array().length > 0){
			return handleServerError.handleServerError({status:"ERROR" , type:'VAL_ERROR' ,message:result.array()} , req , res);
		}
		else{
			User.updateUserProfileData(req.body , function (err , raw) {
				if(err){
					return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
				}
				else if(raw.n >= 1){
					res.status(HttpStatus.OK).send(JSON.stringify({status:"Success"}));
				}
				else{
					return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
				}
			});
		}
	});
};