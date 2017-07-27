module.exports = Object.freeze({
	initServerData:{
		port:3000,
		dbURI:'mongodb://bbj:bbj@ds159208.mlab.com:59208/bjaganuri'/*'mongodb://bbj:bbj@ds159208.mlab.com:59208/bjaganuri'*/
	},
    login:{
		salt_factor:10,
		maxAttempts:5,
		lockoutHours:2*60*60*1000
	}
});