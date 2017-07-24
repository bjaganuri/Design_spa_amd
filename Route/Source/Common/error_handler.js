var HttpStatus = require('http-status-codes');

module.exports.handleServerError = function(err , req , res){
	if(result instanceof Error){
		res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)});
	}
	else{
		res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({status:'Error' , message:'Unknown error occured'});
	}
}