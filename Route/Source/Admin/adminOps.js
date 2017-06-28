var User = require("../../../Model/users");
var JobScheduler = require("../../../Model/schedulejobs");
var fileUploadService = require('../Common/fileUpload');
var async = require("async");

module.exports.getUserAccountsList = function(req,res){
	var param = req.query.searchParam;
	var skip = parseInt(req.query.pageNo);
	var limit = parseInt(req.query.pageSize);
	var noOfPages = 0;
	var recordsSize = 0;
	var query = "";

	if(req.user && req.user.admin){
		//query = {$and : [{name:{$nin:[req.user.name]} , username: {$nin:[req.user.username]} , email : {$nin:[req.user.email]}}, {$or:[{ name:{$regex:param, $options:'i' }} , { username:{$regex:param, $options:'i' }} , { email:{$regex:param, $options:'i' }}]}]};
		query = {$or:[{ name:{$regex:param, $options:'i' }} , { username:{$regex:param, $options:'i' }} , { email:{$regex:param, $options:'i' }}]};		
	}
	else{
		res.send({message:"You are not authorized to access this feature"});
	}
		
	User.count(query , function(err,length){
		if(err) throw err;
		recordsSize = length;

		if(limit === "" || limit === undefined || limit === null){
			limit = recordsSize;
		}
		else{
			limit = limit;
		}

		if(skip === 0 || skip === "" || skip === undefined || skip === null){
			skip = 0;
		}
		else{
			skip = (skip-1)*limit;
		}

		noOfPages = Math.ceil(recordsSize/limit);

		User.getUserAccounts(query,skip,limit,function(err,usersData){
			if(err) throw err;
			res.send({workingUserId:req.user.username , recordsSize:recordsSize, pageNo:parseInt(Math.round(skip/limit)+1) , pageSize:limit, noOfPages:noOfPages , results:usersData});
		});
	});
};

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
			JobScheduler.scheduleCreateMulUserJob(/*"in 1 minutes"*/"now" , {data:data,scheduledBy:req.user.username,schedulerEmail:req.user.email},"Import_users_"+req.file.filename+"_"+req.params.reqFileType+"_"+req.user.username+"_"+Date.now() , function(err,job){
				var result = {};
				if(err){
					result.status = "FAILURE";
					result.reason = err;
				}
				else{
					result.status = "SCHEDULE-SUCCESS";
					result.jobName = job.attrs.name;

					job.attrs.status = "SCHEDULED";
					job.save(function(err){
						if(err){
							throw err;
						}
					});
				}
				res.json(JSON.stringify(result));
			});
		}
	});
};