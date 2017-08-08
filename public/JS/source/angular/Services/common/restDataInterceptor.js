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
			var rejData = angular.fromJson(rejection.data);
			var $rootScope = $injector.get('$rootScope');
			var $state = $injector.get('$state')
			var status = rejData.status;
			var rejectionType = rejData.type;
			var rejectionMessage = rejData.message;
			var statusCode = rejection.status;
			if((statusCode === 500 || statusCode === "500") && status === "ERROR"){
				switch (rejectionType){
					case "NOT_ADMIN":
						$rootScope.errorMessage = rejData.message || "You are not authorized to use this feature. To get access pls contact admin.";
						$rootScope.$broadcast("SERVER_EXCEPTION" , {reload:true , navigateToLogin:false});
						break;
					case "INVALID_REQ":
						$rootScope.errorMessage = rejData.message || "Invalid request, pls check the data you entered and try again.";
						$rootScope.$broadcast("SERVER_EXCEPTION" , {reload:false , navigateToLogin:false});
						break;
					case "SERVER_ERROR":
						$rootScope.errorMessage = rejData.message || "Unkown error occured, pls check the data you have given and try again.";
						$rootScope.$broadcast("SERVER_EXCEPTION" , {reload:false , navigateToLogin:false});
						break;
					case "ACCOUNT_LOCK":
						$rootScope.errorMessage = rejData.message || "Your account has been locked, pls contact admin to unlock and try again.";
						$rootScope.$broadcast("SERVER_EXCEPTION" , {reload:false , navigateToLogin:true});
						break;
					case "LOGIN_REQ":
						$rootScope.$broadcast("LOGIN_REQ");
						break;
				}
			}
			if($rootScope.stateChangeStarted){
				return $q.resolve(rejection);
			}
			else {
				return $q.reject(rejection);
			}
		};
	}]);
});