define(['../module'], function (app) {
	app.controller("recoverUserController" ,['$scope','restDataService', function($scope,restDataService){
		$scope.checkUser = {};
		$scope.newPasswd = {};
		$scope.submitted = false;
		$scope.hidePasswdResetForm = true;
		$scope.validUserData = true;
		$scope.passwdResetSuccess = false;
		$scope.passwdResetFailed = false;
		$scope.getCredentials = function($event){
			$event.preventDefault();
			$scope.submitted = true;
			var recoverUserData = angular.copy($scope.checkUser);
			recoverUserData.dob = (new Date($scope.checkUser.dob)).toDateString();
			if($scope.recoverUserForm.$valid){
				restDataService.getData("users/recoverUser",recoverUserData,function(response){
					if(response.data){
						$scope.user = response.data;
						$scope.validUserData = true;
						$scope.hidePasswdResetForm = false;
					}
					else{
						$scope.validUserData = false;
						$scope.hidePasswdResetForm = true;
					}
					$event.target.reset();
					$scope.checkUser = {};
					$scope.recoverUserForm.$setPristine();
					$scope.recoverUserForm.$setUntouched();
					$scope.submitted = false;
				});
			}
		};

		$scope.setNewPassword = function($event){
			$event.preventDefault();
			if($scope.setNewPasswdForm.$valid){
				$scope.user.password = $scope.newPasswd.password;
				restDataService.postData("users/setNewPassword",$scope.user,function(response){
					if(response.data.status == "Success"){
						$scope.passwdResetSuccess = true;
					}
					else if(response.data.status == "Failed"){
						$scope.passwdResetFailed = true;
					}
					$event.target.reset();
					$scope.newPasswd = {};
					$scope.setNewPasswdForm.$setPristine();
					$scope.setNewPasswdForm.$setUntouched();
				});
			}
		};
	}]);
});