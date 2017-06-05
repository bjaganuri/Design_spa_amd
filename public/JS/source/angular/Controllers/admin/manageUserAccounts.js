define(['../module'], function (app) {
	app.controller("manageUserAccounts" , ['$scope','restDataService','$state','userToView' , function($scope,restDataService,$state,userToView){
		$scope.manageAccountList = {};
		$scope.submitted = false;
		$scope.accountsList = [];
		$scope.dataReadSuccess = false;
		$scope.accountsListHeaders = ['Sl.No' , 'Name' , 'Email' , 'Username' , 'Operational State' , 'Lock/Unlock'];
		$scope.userDataToview = userToView.data;

		$scope.getAccountsList = function($event){
			$event.preventDefault();
			$scope.submitted = true;
			if($scope.searchAccountsForm.$valid){
				$scope.updateTableData($scope.manageAccountList);
			}
		};

		$scope.lockUnlockAccount = function(user){
			restDataService.postData("users/manageAccountLock",user,function(response){
				if(response.data.status == "Success"){
					if($state.is("adminOPs.manageUserAccounts")){
						$scope.updateTableData($scope.manageAccountList);
					}
					else if($state.is("adminOPs.userDetail")){
						$state.reload($state.current.name);
					}
				}
				else{
					alert("Something went wrong pls try again");
				}
			});		
		};

		$scope.updateUserProfile = function(user){
			console.log(user);
		};
		
		$scope.updateTableData = function(filterVal){
			restDataService.getData("users/getUserAccountsList" , filterVal , function(response){
				$scope.accountsList  = [];
				angular.forEach(response.data , function(item,index){
					if(item.opState == "ACTIVE" || item.opState == "INACTIVE")
						response.data[index].action = "Lock";
					else if(item.opState == "LOCKED")
						response.data[index].action = "Unlock";
					else
						response.data[index].action = "Lock";
				});
				[].push.apply($scope.accountsList , response.data);
				$scope.dataReadSuccess = true;
			});	
		};
	}]);
});