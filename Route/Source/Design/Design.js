var PSD = require('psd');
var HttpStatus = require('http-status-codes');
var fileUploadService = require('../Common/fileUpload');

module.exports.uploadPSDFile = function(req,res){
	fileUploadService.filterFile(req,res,function(error,result){
		if(error) {
            return res.status(HttpStatus.OK).send({error:"Invalid file"});
        }
		else{
			var psdFilePath = "./Uploads/"+req.user.username+"/"+req.file.originalname;
			var psdFileName = req.file.originalname;
			var parsedPSD = PSD.fromFile(psdFilePath);
			parsedPSD.parse();

			if(req.body.saveFileToDB === "true" || req.body.saveFileToDB === true){
				fileUploadService.saveFile(req,res,function(storedFile){
					res.status(HttpStatus.OK).send({status:'Success' , psdTree:parsedPSD.tree().export() , message:"File save success",fileSavedToDB:true});
				});
			}
			else{
				res.status(HttpStatus.OK).send({status:'Success' , psdTree:parsedPSD.tree().export() , message:"File has not been saved",fileSavedToDB:false});
			}
			fileUploadService.removeFile(psdFilePath,psdFileName);
		}
	});
};