define(['../module'], function (app) {
	app.controller("signupController" , ['$scope','restDataService',function($scope,restDataService){
		$scope.newUser = {};
		$scope.submitted = false;
		$scope.phoneRegEx="/^[0-9]{10,10}$/;";
		$scope.emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
		$scope.signUpSuccess = false;
		$scope.showSignUpError = false;
		$scope.signUpError = "Unknown Error";

		$scope.signUp = function($event){
			$event.preventDefault();
			$scope.submitted = true;
			var signUpData = angular.copy($scope.newUser);
			signUpData.dob =  (new Date($scope.newUser.dob)).toDateString();
			if($scope.signUpForm.$valid){
				restDataService.postData("users/signUp",signUpData,function(response){
					if(response.data.status == "Error"){
						$scope.showSignUpError = true;
						$scope.signUpSuccess = false;
						$scope.signUpError = response.data.error;
					}
					else if(response.data.status == "Success"){
						$scope.showSignUpError = false;
						$scope.signUpSuccess = true;
					}
					$event.target.reset();
					$scope.newUser = {};
					$scope.signUpForm.$setPristine();
					$scope.signUpForm.$setUntouched();
					$scope.submitted = false;
				});
			}
		};
	}]);
});