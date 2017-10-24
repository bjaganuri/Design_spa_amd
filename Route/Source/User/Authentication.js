var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var HttpStatus = require('http-status-codes');

var User = require("../../../Model/users");
var ActiveUsers = require("../../../Model/activeUsers");
var Constants = require("../../Global_Const/Constants");
var handleServerError = require("../Common/error_handler");

passport.use(new LocalStrategy(function(username, password, done) {
	var userObj = {};
	User.getUserByUsername({username:username},function(err,user){		
		if(err){
			return done(err);
		}
		if(!user){
			return done(null,false,{message:"Unknown User"});
		}

		userObj = Object.assign(user.toObject());

		if(userObj.opState === "LOCKED" && userObj.hasOwnProperty("lockedBy") && userObj.lockedBy !== "System") {
			return done(null,false,{message:"Your account has been locked permanently by "+ user.lockedBy +" with " + user.lockComments + " as comments pls contact admin to unlock your account"});
		}

		else if(userObj.opState === "LOCKED" && userObj.hasOwnProperty("lockedBy") && !userObj.hasOwnProperty("lockUntil")) {
			return done(null,false,{message: "Your account has been locked permanently by " + user.lockedBy + " To unlock pls contact admin"});
		}

		else if (userObj.opState === "LOCKED" && user.isLocked) {
            return user.incrementLoginAttempts(function(err) {
                if (err) {
                    return done(err);
                }
                return done(null, false, { message: 'You have exceeded the maximum number of login attempts. You may try after ',lockUntil:new Date(user.lockUntil)});
            });
        }

		User.comparePassword(password , user.password , function(err, isMatch){
			if(err){
				return done(err);
			}
			if(isMatch){
				var updates = {
                    $set: { loginAttempts: 0,opState:"ACTIVE" },
                    $unset: { lockUntil: 1 }
                };

				/*if (!user.loginAttempts && !user.lockUntil) {
					return done(null,user);
				}*/

				return user.update(updates, function(err) {
                    if (err){ 
						return done(err);
					}
                    return done(null, user);
                });
			}
			else{
				user.incrementLoginAttempts(function(err) {
                    if (err) {
                        return done(err);
                    }
                    return done(null, false, { message: 'Invalid password.  Please try again.' ,loginAttempts:user.loginAttempts+1,maxAttempts:Constants.login.maxAttempts});
                });
			}
		});
	});
}));

passport.serializeUser(function(user, done) {
  	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

module.exports.signUp = function (req,res) {
    var name = req.body.name;
	var email = req.body.email;
	var dob = req.body.dob;
	var gender = req.body.gender;
	var mobile = req.body.mobile;
	var username = req.body.username;
	var password = req.body.password;

	req.checkBody('name' , 'Name is required').notEmpty();
	req.checkBody('dob' , 'Email is required').notEmpty();
	req.checkBody('email' , 'Invalid Email').notEmpty();
	req.checkBody('email' , 'Email is required').isEmail();
	req.checkBody('gender' , 'Gender is required').notEmpty();
	req.checkBody('mobile' , 'Phone No. is required').notEmpty();
	req.checkBody('username' , 'Username is required').notEmpty();
	req.checkBody('password' , 'Password is required').notEmpty();
	req.checkBody('cpassword' , 'Both password do not match').equals(req.body.password);

	req.getValidationResult().then(function(result){
		if(result.array().length > 0){
			return handleServerError.handleServerError({status:"ERROR" , type:'VAL_ERROR' ,message:result.array()} , req , res);
		}
		else{
			var newUser = new User(req.body);
			User.createNewUser(newUser , function(err , user){
				if(err) {
					return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
				}
				else{
					res.status(HttpStatus.OK).send(JSON.stringify({status:"Success"}));
				}
			});
		}
	});
};

module.exports.login = function (req, res, next) {
    passport.authenticate('local', function(err, user, info) {
		if (err) {
			return next(err);
		}
		if (!user) { 
			return res.status(HttpStatus.OK).send(JSON.stringify({status:"Failed",info:info}));
		}
		req.logIn(user, function(err) {
			if (err) {
				return next(err); 
			}
			ActiveUsers.removeActiveSession({$and:[{'session.passport.user':{$eq:req.session.passport.user} , _id:{$not:{$eq:req.sessionID}}}]},function (error) {
				if(error) {
					return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
				}
				return res.status(HttpStatus.OK).send(JSON.stringify({status:"Success",message:info}));
			});
		});
	})(req, res, next);
};

module.exports.recoverUser = function (req,res) {
    User.recoverUserData(req.query , function(err , user){
		if(err){
			return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
		}
		res.status(HttpStatus.OK).send((user !== null && user !== '' && user !== undefined && user !== ' ') ? user : {});
	});
};

module.exports.setNewPassword = function (req,res) {
    var name = req.body.name;
	var email = req.body.email;
	var dob = req.body.dob;
	var gender = req.body.gender;
	var mobile = req.body.mobile;
	var username = req.body.username;
	var password = req.body.password;

	req.checkBody('name' , 'Name is required').notEmpty();
	req.checkBody('dob' , 'Email is required').notEmpty();
	req.checkBody('email' , 'Invalid Email').notEmpty();
	req.checkBody('email' , 'Email is required').isEmail();
	req.checkBody('gender' , 'Gender is required').notEmpty();
	req.checkBody('mobile' , 'Phone No. is required').notEmpty();
	req.checkBody('username' , 'Username is required').notEmpty();
	req.checkBody('password' , 'Password is required').notEmpty();
	
	req.getValidationResult().then(function(result){
		if(result.array().length > 0){
			return handleServerError.handleServerError({status:"ERROR" , type:'VAL_ERROR' ,message:result.array()} , req , res);
		}
		else{
			User.updateUserProfileData(req.body , function(err , raw){
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

module.exports.checkUserChoiceAvailability = function(req,res){
	var params = req.query;
	var fieldName = "";
	fieldName = Object.keys(params)[0];
	var query = {};
	query[fieldName] = {$in:[params[fieldName]]};
	User.getUserAccounts(query,0,10,function(err,resultArr){
		if(err){
			return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
		}
		else if(resultArr.length > 0){
			res.status(HttpStatus.OK).send({status:true});	
		}
		else{
			res.status(HttpStatus.OK).send({status:false});
		}
	});
};
