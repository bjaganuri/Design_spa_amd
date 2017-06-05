var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var bcrypt = require("bcryptjs");
var assert = require('assert');
var Constants = require("../Route/Global_Const/Constants");
var Schema = mongoose.Schema;
var SALT_WORK_FACTOR = Constants.login.salt_factor;
var MAX_LOGIN_ATTEMPTS = Constants.login.maxAttempts;
var LOCK_TIME = Constants.login.lockoutHours;

var userSchema = new Schema({
	name: { type: String},
	email:{ type: String, required: true, unique: true },
	altEmail:{ type: String},
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	dob:{ type: Date},
	gender:{ type: String},
	mobile:{ type: String},
	altMobile:{ type: String},
	loginAttempts: { type: Number, required: true, default: 0 },
	lockUntil: { type: Number },
	admin:{type: Boolean},
	opState:{type: String}
});

userSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) 
		return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) 
			return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) 
				return next(err);

            user.password = hash;
            next();
        });
    });
});

userSchema.methods.incrementLoginAttempts = function(cb) {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, cb);
    }
    var updates = { $inc: { loginAttempts: 1 } };
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME};
    }
    return this.update(updates, cb);
};


var User = mongoose.model('User', userSchema);
module.exports = User;

var hashPwdAndUpdateData = function  (query,user,salt,callback){
	bcrypt.genSalt(salt, function(err, salt) {
		assert.ifError(err);
		bcrypt.hash(user.password, salt, function(err, hash) {
			assert.ifError(err);
			user.password = hash;
			updateData({username:user.username} , user , {multi:false} , callback);
		});
	});
};

var updateData = function (query,userData,optParams,callback){
	User.update(query , userData ,optParams, callback);
};

var getData = function(query , optParams , callback){
	User.findOne(query, optParams , callback);
};

module.exports.createNewUser = function(newUser , callback){
	/*bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		assert.ifError(err);
		bcrypt.hash(newUser.password, salt, function(err, hash) {
			assert.ifError(err);
			newUser.password = hash;
			newUser.save(callback);
		});
	});*/
	if(!newUser.hasOwnProperty('admin')){
		newUser.admin = false;
	}
	newUser.opState = "ACTIVE";
	newUser.save(callback);
};

module.exports.getUserByUsername = function(query , callback){
	User.findOne(query,callback);
};

module.exports.getUserById = function(id , callback){
	User.findById(id,callback);
};

module.exports.comparePassword = function(candidatePassword,hash,callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
		if(err) 
			return(err);
		callback(null,isMatch);
	});
};

module.exports.recoverUserData = function(queryData , callback){
	var query = {email:{$eq:queryData.email},mobile:{$eq:queryData.mobile},dob:{$eq:queryData.dob}};
	var optParams = {lockUntil:0,loginAttempts:0,isLocked:0,password:0};
  	getData(query , optParams , callback);
};

module.exports.getUserProfile = function(query,callback){
	var optParams =  {lockUntil:0,loginAttempts:0,isLocked:0,password:0};
	getData(query , optParams , callback);
};

module.exports.updateUserProfileData = function (user,callback) {
	var id = new ObjectId(user['_id']);
	if(user.password != undefined && user.password != "" && user.password != null){
		hashPwdAndUpdateData({_id:id.toHexString(),username:user.username}, user , SALT_WORK_FACTOR , callback);
	}
	else{
		updateData({_id:id.toHexString(),username:user.username} , user , {multi:false} , callback);
	}
};

module.exports.getUserAccounts = function(query,callback){
	User.find(query,{_id:1,name:1,email:1,username:1,opState:1},callback);
};