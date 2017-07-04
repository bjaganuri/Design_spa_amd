var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var HttpStatus = require('http-status-codes');

var User = require("../../../Model/users");
var ActiveUsers = require("../../../Model/activeUsers");
var Constants = require("../../Global_Const/Constants");

passport.use(new LocalStrategy(function(username, password, done) {
	User.getUserByUsername({username:username},function(err,user){
		if(err) throw err;
		if(!user){
			return done(null,false,{message:"Unknown User"});
		}

		if(user.opState === "LOCKED"){
			return done(null,false,{message:"Your account has been locked permanently by "+ user.lockedBy +" with " + user.lockComments + " as comments pls contact admin to unlock your account"});
		}

		if (user.isLocked) {
            return user.incrementLoginAttempts(function(err) {
                if (err) {
                    return done(err);
                }
                return done(null, false, { message: 'You have exceeded the maximum number of login attempts. You may try after ',lockUntil:new Date(user.lockUntil)});
            });
        }

		User.comparePassword(password , user.password , function(err, isMatch){
			if(err) throw err;
			if(isMatch){
				var updates = {
                    $set: { loginAttempts: 0 },
					$set:{opState:"ACTIVE"},
                    $unset: { lockUntil: 1 }
                };

				/*if (!user.loginAttempts && !user.lockUntil) {
					return done(null,user);
				}*/

				return user.update(updates, function(err) {
                    if (err) 
						return done(err);
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

	var errors = req.validationErrors();

	if(errors){
		res.send(JSON.stringify(errors));
	}
	else{
		var newUser = new User(req.body);
		User.createNewUser(newUser , function(err , user){
			if(err) {
				res.send(JSON.stringify({status:"Error",error:err.errmsg}));
			}
			else{
				res.send(JSON.stringify({status:"Success"}));
			}
		});
	}
};

module.exports.login = function (req, res, next) {
    passport.authenticate('local', function(err, user, info) {
		if (err) {
			return next(err);
		}
		if (!user) { 
			return res.send(JSON.stringify({status:"Failed",info:info}));
		}
		req.logIn(user, function(err) {
			if (err) {
				return next(err); 
			}
			ActiveUsers.removeActiveSession({$and:[{'session.passport.user':{$eq:req.session.passport.user} , _id:{$not:{$eq:req.sessionID}}}]},function (error) {
				if(error) throw error;
			});
			return res.status(HttpStatus.OK).send(JSON.stringify({status:"Success",message:info}));
		});
	})(req, res, next);
};

module.exports.recoverUser = function (req,res) {
    User.recoverUserData(req.query , function(err , user){
		if(err) throw err;
		res.send(user);
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

	var errors = req.validationErrors();

	if(errors){
		res.send(JSON.stringify(errors));
	}
	else{
		User.updateUserProfileData(req.body , function(err , raw){
			if(err) throw err;
			if(raw.n >= 1){
				res.send(JSON.stringify({status:"Success"}));
			}
			else{
				res.send(JSON.stringify({status:"Failed"}));
			}
		});
	}
};