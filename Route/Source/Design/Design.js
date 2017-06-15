var fileUploadService = require('../Common/fileUpload');

module.exports.uploadPSDFile = function(req,res){
	fileUploadService.saveFile(req,res);
};