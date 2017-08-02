define(['../module'], function (app) {
	app.controller("signupController" , ['$scope','restDataService','$state','fileUpload','$timeout',function($scope,restDataService,$state,fileUpload,$timeout){
		$scope.newUser = {};
		$scope.submitted = false;
		$scope.phoneRegEx="/^[0-9]{10,10}$/;";
		$scope.emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
		$scope.signUpSuccess = false;
		$scope.showSignUpError = false;
		$scope.signUpError = "Unknown Error";
		$scope.genericSignUp = true;
		$scope.fileToImport = $scope.userListFile;
		$scope.newUser.admin = false;

		$scope.signUp = function($event){
			$event.preventDefault();
			$scope.submitted = true;
			var signUpData = angular.copy($scope.newUser);
			signUpData.dob =  (new Date($scope.newUser.dob)).toDateString();
			if($scope.signUpForm.$valid){
				restDataService.postData("users/signUp",signUpData,function(response){
					if(response.data.status === "VAL_ERROR"){
						$scope.showSignUpError = true;
						$scope.signUpSuccess = false;
						$scope.signUpError = response.data.message;
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
					$scope.newUser.admin = false;
				});
			}
		};

		$scope.activateImportOpt = function(type){
			if(type === "csv"){
				document.getElementById('importUserList').accept = ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel";
			}
			else if(type === "json"){
				document.getElementById('importUserList').accept = ".json";
			}
			document.getElementById('importUserList').click();
		};

		$scope.importUsersList = function(importedFile , fileType){
			var file = importedFile;
			var uploadUrl = "users/importUsers/"+fileType;
			var fd = new FormData();
			fd.append('file', file);
			fd.append('comments', "No comment");	
			fd.append('fileName', file.name);
			fd.append('type', file.type);

			fileUpload.uploadFileToUrl(fd, uploadUrl,function(res){
				console.log(res.data);
			});
		};
		
		if(!$state.includes('authenticateUser') && $state.$current.name === "adminOPs.addNewUser"){
			$scope.genericSignUp = false;
			$scope.$parent.$parent.$on("$includeContentLoaded" , function(){
				$timeout(function(){
					if(document.getElementById('importUserList')){
						document.getElementById('importUserList').addEventListener("change" , function(event){
							var file = event.target.files[0];
							var fileTypeToAccept = event.target.accept;
							var fileType = "";
							if(file.type !== "" && (file.type.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") || file.type.includes("application/vnd.ms-excel")) && fileTypeToAccept.includes(file.type)){
								fileType = "csv";
							}
							else if(file.type === "" && file.name.split(".")[1] === "json" && fileTypeToAccept.includes(file.name.split(".")[1])){
								fileType = "json";
							}
							if(fileType == ""){
								alert("Invalid file type");
							}
							else{
								angular.element(event.target).scope().importUsersList(file,fileType);
							}
						});			
					}
				});
			});
		}
	}]);
});