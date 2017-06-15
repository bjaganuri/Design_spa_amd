var User = require("../../../Model/users");
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
			res.send(err);
		}
		else{
			try {
				var dataObj = JSON.parse(data);
			} catch (e) {
				dataObj = data;
			}
			User.insertMultiple(dataObj , function(err,result){
				if(err){
					res.send(err);
				}
				else{
					async.filterLimit(result , 10 , function(item , cb){
						cb(null , item.hasOwnProperty('error'));
					} , function(E , resArray){
						if(E){
							res.send(E);
						}
						else{
							if(resArray.length === 0){
								res.json({status:"SUCCESS"});
							}
							else{
								res.json({status:"FAILURE" , failures:resArray});
							}								
						}
					});						
				}
			});
		}
	});
};