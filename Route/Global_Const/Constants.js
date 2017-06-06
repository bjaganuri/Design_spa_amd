module.exports = Object.freeze({
	initServerData:{
		port:3000,
		dbURI:'mongodb://bbj:bbj@localhost/NodeApp'
	},
    login:{
		salt_factor:10,
		maxAttempts:5,
		lockoutHours:2*60*60*1000
	}
});