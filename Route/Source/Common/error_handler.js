var HttpStatus = require('http-status-codes');

function CustomError(errObj){
	for(key in errObj){
		this[key] = errObj[key];
	}
}

module.exports.handleServerError = function(errObj , req , res){
	if(typeof errObj === 'object'){
		CustomError.prototype = Object.create(Error.prototype);
		CustomError.prototype.constructor = CustomError;
		try {
			throw new CustomError(errObj);
		} catch (e) {
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e);
		}
	}
	else if(errObj instanceof Error){
		res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({status:'ERROR' , type:'SERVER_ERROR' , message: errObj});
	}
	else{
		res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({status:'ERROR' , tpe:'SERVER_ERROR' , message:'Unknown error occured'});
	}
};