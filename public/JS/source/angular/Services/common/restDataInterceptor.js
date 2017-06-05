define (['../module'] , function(app){
	app.service('restDataInterceptor' , ['$q','$injector',function ($q,$injector) {
		this.request = function (config) {
			return config;
		};

		this.requestError = function (rejection) {
			console.log(rejection);
			return rejection;
		};

		this.response = function (response) {
			return response;
		};

		this.responseError = function (rejection) {
			console.log(rejection);
			var $rootScope = $injector.get('$rootScope');
			if(rejection.status == 401){
				/*var restDataService = $injector.get('restDataService');
				var $http = $injector.get('$http');
				var $window = $injector.get('$window');
				var deferred = $q.defer();
				if($window.sessionStorage.getItem("loggedInUser")){
					restDataService.post("users/login",$window.sessionStorage.getItem("loggedInUser")).then(deferred.resolve, deferred.reject);
					return deferred.promise.then(function () {
						return $http(rejection.config);
					});
				}*/
				$rootScope.$broadcast("loggedOut");
			}
			return $q.reject(rejection);
		};
	}]);
});