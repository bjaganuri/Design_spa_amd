var User = require("../../../Model/users");
var JobScheduler = require("../../../Model/schedulejobs");
var fileUploadService = require('../Common/fileUpload');
var async = require("async");

module.exports.getUserAccountsList = function(req,res){
	var param = req.query.searchParam;
	var query = "";
	if(req.user && req.user.admin){
		query = {$and : [{name:{$nin:[req.user.email]} , username: {$nin:[req.user.username]} , name : {$nin:[req.user.email]}}, {$or:[{ name:{$regex:param, $options:'i' }} , { username:{$regex:param, $options:'i' }} , { email:{$regex:param, $options:'i' }}]}]};
		User.getUserAccounts(query, function(err,usersData){
			if(err) throw err;
			res.send(usersData);
		});
	}
	else{
		res.send({message:"You are not authorized to access this feature"});
	}
}

module.exports.manageLockAdminRight = function(req, res){
	User.getUserProfile({username:req.body.username , email:req.body.email} , function(err,user){
		if(err) throw err;
		if(req.body.action !== undefined && req.body.action !== null){
			if(req.body.action === "Lock"){
				user.opState = "LOCKED";
			}
			else{
				user.opState = "ACTIVE";
			}

		}
		if(req.body.admin !== undefined && req.body.admin !== null){
			if(req.body.admin === "Grant"){
				user.admin = true;
			}
			else if(req.body.admin === "Revoke"){
				user.admin = false;
			}

		}
		User.updateUserProfileData(user , function (err , raw) {
			if(err) throw err;
			if(raw.n >= 1){
				res.send(JSON.stringify({status:"Success"}));
			}
			else{
				res.send(JSON.stringify({status:"Failed"}));
			}
		});
	});
};

module.exports.importUsersList = function(req,res){
	fileUploadService.getFileData(req,res,function(err , data){
		if(err){
			res.json(err);
		}
		else{
			JobScheduler.scheduleCreateMulUserJob(data,"Import_users_"+req.file.filename+"_"+req.params.reqFileType+"_"+req.user.username+"_"+Date.now() , function(err,job){
				var result = {};
				if(err){
					result.status = "FAILURE";
					result.reason = err;
				}
				else{
					result.status = "SUCCESS";
					result.jobName = job.attrs.name;
				}
				res.json(JSON.stringify(result));
			});
		}
	});
};