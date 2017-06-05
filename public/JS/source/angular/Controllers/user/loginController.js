define(['../module'], function (app) {
	app.controller("loginController" , ['$scope','$location','$window','$state','restDataService' ,function($scope,$location,$window,$state,restDataService){
		$scope.user = {};
		$scope.validUser = true;
		$scope.loginError = "Invalid Username/Password";

		$scope.login = function($event){
			$event.preventDefault();
			if($scope.loginForm.$valid){
				restDataService.postData("users/login",$scope.user,function (response) {
					if(response.data.status == "Success"){
						$scope.validUser = true;
						if(!$state.includes("authenticateUser") && !$state.includes("otherwise")){
							$window.location.reload();
						}
						else{
							$state.transitionTo("common.home");
						}
						//$window.sessionStorage.setItem("loggedInUser" , JSON.stringify($scope.user));
					}
					else if(response.data.status == "Failed"){
						$scope.validUser = false;
						if(response.data.info.lockUntil){
							$scope.loginError = response.data.info.message+ " "+ (new Date(response.data.info.lockUntil)).toLocaleString();	
						}
						else{
							$scope.loginError = response.data.info.message;
						}
					}
					$event.target.reset();
					$scope.user = {};
					$scope.loginForm.$setPristine();
					$scope.loginForm.$setUntouched();
				});
			}
		};
	}]);
});