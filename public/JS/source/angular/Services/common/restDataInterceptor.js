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
			var data = (angular.fromJson(rejection.data)).status;
			var $rootScope = $injector.get('$rootScope');
			if(rejection.status == 401 && data === "LOGIN_REQUIRED"){
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
			else if(rejection.status == 401 && data === "ACCOUNT_LOCKED"){
				$rootScope.accountLockComments = (angular.fromJson(rejection.data)).message;
				$rootScope.$broadcast("accountLocked");
			}
			return $q.reject(rejection);
		};
	}]);
});