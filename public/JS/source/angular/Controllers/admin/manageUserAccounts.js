define(['../module'], function (app) {
	app.controller("manageUserAccounts" , ['$scope','restDataService','$state','userToView','ModalService' , 
		function($scope,restDataService,$state,userToView,ModalService){
		$scope.manageAcctSearchParams = {};
		$scope.submitted = false;
		$scope.sameAsWorkingUserID = "";
		$scope.manageAcctSearchParams.pageNo =1;
		$scope.manageAcctSearchParams.pageSize = 10;
		$scope.lastPageNo = 0;
		$scope.recordsSize = 0;
		$scope.accountsList = [];
		$scope.dataReadSuccess = false;
		$scope.accountsListHeaders = ['Sl.No' , 'Name' , 'Email' , 'Username' , 'Operational State' , 'Lock/Unlock'];
		$scope.userDataToview = userToView.data;
		$scope.userDataToUpdate = {};

		$scope.getAccountsList = function($event){
			$event.preventDefault();
			$scope.manageAcctSearchParams.pageNo =1;
			$scope.submitted = true;
			if($scope.searchAccountsForm.$valid){
				$scope.updateTableData($scope.manageAcctSearchParams);
			}
		};

		$scope.onPageSizeChange = function(){
			$scope.manageAcctSearchParams.pageNo =1;
			$scope.updateTableData($scope.manageAcctSearchParams);
		};

		$scope.onPageNoChange = function(page){
			var pageChanged = false;
			if(page === 'FIRST'){
				if(parseInt($scope.manageAcctSearchParams.pageNo) === 1){
					$scope.manageAcctSearchParams.pageNo = 1;
					pageChanged = false;
				}
				else{
					$scope.manageAcctSearchParams.pageNo = 1;
					pageChanged = true;
				}
			}
			else if(page === 'PREV'){
				if(parseInt($scope.manageAcctSearchParams.pageNo) <= 1){
					$scope.manageAcctSearchParams.pageNo = 1;
					pageChanged = false;
				}
				else{
					$scope.manageAcctSearchParams.pageNo = $scope.manageAcctSearchParams.pageNo-1;
					pageChanged = true;
				}
			}
			else if(page === 'NEXT'){
				if(parseInt($scope.manageAcctSearchParams.pageNo) >= parseInt($scope.lastPageNo)){
					$scope.manageAcctSearchParams.pageNo = $scope.lastPageNo;
					pageChanged = false;
				}
				else{
					$scope.manageAcctSearchParams.pageNo = $scope.manageAcctSearchParams.pageNo+1;
					pageChanged = true;
				}
			}
			else if(page === 'LAST'){
				if(parseInt($scope.manageAcctSearchParams.pageNo) === parseInt($scope.lastPageNo)){
					$scope.manageAcctSearchParams.pageNo = $scope.lastPageNo;
					pageChanged = false;
				}
				else{
					$scope.manageAcctSearchParams.pageNo = $scope.lastPageNo;
					pageChanged = true;
				}
			
			}

			if(pageChanged === true || pageChanged === "true"){
				$scope.updateTableData($scope.manageAcctSearchParams);
			}
		};
		
		$scope.lockUnlockAccount = function(user){
			angular.copy(user , $scope.userDataToUpdate);
			var _this = $scope;
			var modalInstance = ModalService.showModal({
				templateUrl: 'adminOpComments.html',
				controller:function($scope, $element, close){
					$scope.submitted = false;
					$scope.upDateAction = function($event){
						$event.preventDefault();
						$scope.submitted = true;
						if($scope.manageUserAccountForm.$valid){
							_this.userDataToUpdate.comments = $scope.comments;
							_this.executeUpdate(_this.userDataToUpdate);
							$element.modal('hide');
							$event.target.reset();
							$scope.comments = "";
							$scope.manageUserAccountForm.$setPristine();
							$scope.manageUserAccountForm.$setUntouched();
							$scope.submitted = false;
						}
					}
				},
				preClose: function(modal){
					return modal.element.modal('hide');
				}
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					
				});
			});
		};

		$scope.executeUpdate = function(user){
			restDataService.postData("users/manageAccountLock",user,function(response){
				if(response.data.status == "Success"){
					if($state.is("adminOPs.viewUser")){
						$scope.updateTableData($scope.manageAcctSearchParams);
					}
					else if($state.is("adminOPs.viewUserDetail")){
						$state.reload($state.current.name);
					}
				}
				else{
					alert("Something went wrong pls try again");
				}
			});
		}
		
		$scope.updateTableData = function(acctListingParams){
			restDataService.getData("users/getUserAccountsList" , acctListingParams , function(response){
				$scope.accountsList  = [];
				angular.forEach(response.data.results , function(item,index){
					if(item.opState == "ACTIVE" || item.opState == "INACTIVE")
						response.data.results[index].action = "Lock";
					else if(item.opState == "LOCKED")
						response.data.results[index].action = "Unlock";
					else
						response.data.results[index].action = "Lock";
				});
				[].push.apply($scope.accountsList , response.data.results);
				$scope.sameAsWorkingUserID = response.data.workingUserId;
				$scope.lastPageNo = response.data.noOfPages;
				$scope.recordsSize = response.data.recordsSize;
				$scope.dataReadSuccess = true;
			});	
		};
	}]);
});