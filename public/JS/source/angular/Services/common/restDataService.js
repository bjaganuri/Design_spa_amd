define (['../module'] , function(app){
	//Service communicate with backend and get or post data
	app.service("restDataService" , ['$http' , '$log' , function ($http,$log) {
		this.get = function (url,data) {
			return $http({
				url: url,
				method: "GET",
				params: data
			});
		};

		this.post = function (url,data) {
			return $http({
				url: url,
				method: "POST",
				data: data
			});
		};
		
		this.getData = function (url,data,callback) {
			this.get(url,data).then(function (response) {
				callback(response);
			},function (Error) {
				$log.error(Error);
			});
		};

		this.postData = function (url,data,callback) {
			this.post(url,data).then(function (response) {
				callback(response);
			},function (Error) {
				$log.error(Error);
			});
		};
	}]);
});