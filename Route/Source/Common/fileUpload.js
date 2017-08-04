var multer  = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');
var jsonfile = require('jsonfile')
var csv = require('csvtojson');
var HttpStatus = require('http-status-codes');
var gridFS = require("../../../Model/gridFsOperation");
var handleServerError = require("./error_handler");

var fileStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		var dest = 'Uploads/'+req.user.username;
        mkdirp.sync(dest , function (err) {
        	if(err)
        		console.log(err);
        	console.log('Uploads directory created');
        });
        cb(null, dest);
	},
	filename: function (req, file, cb) {
    	var ext = require('path').extname(file.originalname);
    	ext = ext.length>1 ? ext : "." + require('mime').extension(file.mimetype);
    	require('crypto').pseudoRandomBytes(16, function (err, raw) {
        	cb(null, (err ? raw.toString('hex') : file.originalname.substr(0,file.originalname.lastIndexOf('.'))) + ext);
    	});
	}
});

module.exports.filterFile = multer({ 
	storage: fileStorage,
	fileFilter:function (req, file, callback) {
		var ext = path.extname(file.originalname);
		if(ext == req.params.reqFileType) {
            return callback(new Error('Only' + req.params.reqFileType + ' files allowed'));
        }
        callback(null, true);
	}
}).single('file');

module.exports.fileExists = function (req , res) {
    gridFS.fileExists({$or:[{$and:[{'metadata.copyOf':{$eq:'own'}},{'metadata.isCopy':{$eq:false}},{filename:req.query.fileName}]} , {$and:[{'metadata.copyOf':{$eq:req.query.fileName}},{'metadata.isCopy':{$eq:true}}]}], contentType:req.query.type , 'metadata.owner_doc_key':{$eq:req.user['_id']}} , function (err,files) {
		if (err){
			return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
		}
		else if(files.length >= 1){
			res.status(HttpStatus.OK).send({status:true , length:files.length});
		}
		else{
			res.status(HttpStatus.OK).send({status:false , length:files.length});
		}
	});
};

module.exports.saveFile = function (req, res, callback) {
	var _this = this;
	gridFS.fileExists({$or:[{$and:[{'metadata.copyOf':{$eq:'own'}},{'metadata.isCopy':{$eq:false}},{filename:req.body.fileName}]} , {$and:[{'metadata.copyOf':{$eq:req.body.fileName}},{'metadata.isCopy':{$eq:true}}]}], contentType:req.body.type , 'metadata.owner_doc_key':{$eq:req.user['_id']}} , function (err,files) {
		if(err){
			return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
		}
		else{
			var filesLength = files.length;
			var metaData = {};
			
			Object.assign(metaData , {
				owner_id:req.user.username,
				owner_doc_key:req.user['_id'],
				owner_comments:req.body.comments,
				isCopy:false,
				copyOf:""
			});
			
			if((req.body.overwrite === "true" || req.body.overwrite === true) && filesLength > 0){
				for(var i=0;i<filesLength;i++){
					gridFS.removeExisting(files[i] , function (err) {
						if(err){
							return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
						}
						console.log('success');
					});
				}
				metaData.isCopy = false;
				metaData.copyOf = "own";
			}
			else if ((req.body.overwrite === "false" || req.body.overwrite === false) && filesLength > 0){
				var tempFileName = req.file.filename.substring(0,req.file.filename.lastIndexOf('.'));
				var newFileName = tempFileName+"_copy_"+Date.now()+"."+req.file.filename.substring(req.file.filename.lastIndexOf('.')+1);
				metaData.isCopy = true;
				metaData.copyOf = req.file.filename;
				req.file.filename = newFileName;
				req.file.originalname = newFileName;
			}
			else if ((req.body.overwrite === "false" || req.body.overwrite === false) && filesLength === 0){
				metaData.isCopy = false;
				metaData.copyOf = "own";
			}
			_this.writeFileToDB(req.file, metaData , callback);
		}
	});
};

module.exports.writeFileToDB = function(file,metaData,callback){
	gridFS.writeFileToDB(file,metaData,function (error, storedFile) {
		if(error){
			return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
		}
		else{
			callback.call(null,storedFile);
		}
	});
}

module.exports.removeTempFile = function(filePath,fileName){
	fs.unlink(filePath, function (err) {
		if(err){
			console.log(err);
		}
		else{
			console.log(fileName + ' deleted successfully from temp. location');
		}
	});
};

module.exports.getFileData = function(req,res,cb){
	this.filterFile(req,res , function(error){
		if(error){
			return handleServerError.handleServerError({status:"ERROR" , type:'SERVER_ERROR'} , req , res);
		}
		else{
			if(req.params.reqFileType === "json"){
				jsonfile.readFile(req.file.path , cb);
			}
			else if(req.params.reqFileType === "csv"){
				csv().fromFile(req.file.path).on('end_parsed',(jsonArrObj)=>{
					cb.apply(null,[null,jsonArrObj]);
				});
			}
		}
	});
};