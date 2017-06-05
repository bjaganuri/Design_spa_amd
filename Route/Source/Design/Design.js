var multer  = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var PSD = require('psd');
var gridFS = require("../../../Model/gridFsOperation");

var psdFileStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		var dest = 'PSD_Uploads/'+req.user.username;
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
        	cb(null, (err ? raw.toString('hex') : file.originalname.split(".")[0] ) + ext);
    	});
	}
});

var psdFileUpload = multer({ 
	storage: psdFileStorage,
	fileFilter:function (req, file, callback) {
		var ext = path.extname(file.originalname);
		if(ext === '.psd') {
            return callback(new Error('Only PSD screens are allowed'));
        }
        callback(null, true);
	}
}).single('psdFile');

module.exports.fileExists = function (req , res) {
    gridFS.fileExists({filename:req.query.fileName, contentType:req.query.type , 'metadata.owner_id':{$eq:req.user['_id']}} , function (err,files) {
		if (err){
			throw err;
		}
		if(files.length >= 1){
			res.send({status:true});
		}
		else{
			res.send({status:false});
		}
	});
};

module.exports.parsePSD = function (req, res) {
    psdFileUpload(req,res,function(error) {
        if(error) {
            return res.send({error:"Invalid file"});
        }
        else{
        	if(req.body.overwrite === "true"){
        		gridFS.fileExists({filename:req.body.fileName, contentType:req.body.type , 'metadata.owner_id':{$eq:req.user['_id']}} , function (err,files) {
        			var filesLength = files.length;
        			var fileName = "";
        			if(err)
        				throw err;
        			for(var i=0;i<filesLength;i++){
        				fileName = files[i].filename;
        				console.log(fileName + ' Remove initiated');
        				gridFS.removeExisting(files[i] , function (err) {
        					if(err) throw err;
        					console.log(fileName + ' File remove success');
        				});
        			}
        		});
        	}
        	gridFS.writeFileToDB(req.file,req.user,req.body.comments,function (error, storedFile) {
        		if(error){
        			throw error;
        		}
        		console.log(storedFile.filename + " Written to DB");
        	});
        	// var psd = PSD.fromFile("./Uploads/"+req.file.originalname);
        	// psd.parse();
        	// psd.image.saveAsPng('./Uploads/'+req.file.originalname.split('.')[0]+'.png');
        	// res.send(psd.tree().export());
        	res.send('ok');
        }
    });
}