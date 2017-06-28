var mongoose = require('mongoose');
var Agenda = require('agenda');
var async = require("async");
var User = require("./users");
var appConstants = require("../Route/Global_Const/Constants");
var agenda = new Agenda();

mongoose.connection.on('open', function callback () {
	var dbURI = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || appConstants.initServerData.dbURI;
    agenda.database(dbURI , 'adminJobs');

	agenda.on('start', function(job) {
		job.attrs.status = "PROGRESS";
		job.attrs.scheduledBy = job.attrs.data.scheduledBy;
		job.attrs.schedulerEmail = job.attrs.data.schedulerEmail;
		job.save(function(){
			console.log("Job %s attributes saved and started execution", job.attrs.name);
		});
	});

	agenda.on('fail', function(err, job) {
		job.attrs.status = "FAILURE";
		job.attrs.result = err;
		job.save(function(err){
			if(err){
				throw err;
			}
			console.log("Job failed with error: %s", err.message);
		});
	});

	agenda.on('complete', function(job) {
		job.save(function(err){
			if(err){
				throw err;
			}
			console.log("Job %s finished", job.attrs.name);
		});
	});
});

function scheduleJob(jobScheduleTime , jobName,attrs,cb){
	//agenda.now(jobName, attrs , cb);
	agenda.schedule(jobScheduleTime,jobName, attrs , cb);
	agenda.start();
}

module.exports.scheduleCreateMulUserJob = function(jobScheduleTime , dataObj,jobName,callback){
	agenda.define(jobName , {priority: 'high'} , function(job,done){
		User.insertMultiple(job.attrs.data.data , function(err,result){
			if(err){
				done(err);
			}
			else{
				async.filterLimit(result , 10 , function(item , cb){
					cb(null , item.hasOwnProperty('error'));
				} , function(E , resArray){
					if(E){
						throw E;
					}
					else{
						if(resArray.length === 0)
							job.attrs.status = "SUCCESS";
						else if(resArray.length > 0)
							job.attrs.status = "PARTIAL-SUCCESS";
						job.attrs.result = resArray;
						done();
					}
				});						
			}
		});
	});

	scheduleJob(jobScheduleTime , jobName ,  {data: dataObj.data , scheduledBy:dataObj.scheduledBy , schedulerEmail:dataObj.schedulerEmail } , callback);	
};