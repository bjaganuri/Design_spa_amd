define(['../module'] , function(app){
	app.service('fileUpload', ['$http', function ($http) {
		this.uploadFileToUrl = function(fd,uploadUrl,cb){			
			$http({
				url:uploadUrl,
				method:"POST",
				data:fd,
				transformRequest: angular.identity,
				headers: {
					'Content-Type': undefined
				}
			})
			.then(function(response){
				cb(response);
			},function(error){
				console.log(error);
			});
		};
	}]);
});