define(['../module'], function (app) {
	app.controller("manageUserAccounts" , ['$scope','restDataService','$state','userToView','ModalService','lastViewedUserActList','viewUserLastSearchParams',
		function($scope,restDataService,$state,userToView,ModalService,lastViewedUserActList,viewUserLastSearchParams){
		$scope.manageAcctSearchParams = {};
		$scope.submitted = false;
		$scope.sameAsWorkingUserID = "";
		$scope.manageAcctSearchParams.pageNo =1;
		$scope.manageAcctSearchParams.pageSize = 10;
		$scope.lastPageNo = 0;
		$scope.recordsSize = 0;
		$scope.accountsList = [];
		$scope.dataReadSuccess = false;
		$scope.accountsListHeaders = ['Sl.No' , 'Name' , 'Email' , 'Username' , 'Operational State' , 'Admin' , 'Action'];
		$scope.userDataToview = userToView.data;
		$scope.userDataToUpdate = {};

		$scope.getAccountsList = function($event){
			$event.preventDefault();
			$scope.manageAcctSearchParams.pageNo =1;
			$scope.submitted = true;
			if($scope.searchAccountsForm.$valid){
				$scope.fecthAndUpDateTableData($scope.manageAcctSearchParams);
			}
		};

		$scope.onPageSizeChange = function(){
			$scope.manageAcctSearchParams.pageNo =1;
			$scope.fecthAndUpDateTableData($scope.manageAcctSearchParams);
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
				$scope.fecthAndUpDateTableData($scope.manageAcctSearchParams);
			}
		};
		
		$scope.lockUnlockAccount = function(user,toUpdate){
			angular.copy(user , $scope.userDataToUpdate);
			var _this = $scope;
			var modalInstance = ModalService.showModal({
				templateUrl: 'adminOpComments.html',
				controller:function($scope, $element, close){
					$scope.adminOpModalTitle = "Update "+_this.userDataToUpdate.name+"\'s Account status and Admin Rights";
					$scope.toUpdate = toUpdate;
					$scope.operationalStatus = _this.userDataToUpdate.opState;
					$scope.adminRightGrantStatus = _this.userDataToUpdate.admin;
			
					if($state.is('adminOPs.viewUserDetail')){
						$scope.isUserDetailsPage = true;
					}

					if($state.is('adminOPs.viewUserDetail') && toUpdate === 'opState'){
						$scope.adminRight = false;
						$scope.opStatus = true;
						$scope.adminOpModalTitle = "Update "+_this.userDataToUpdate.name+"\'s Account status";
					}

					if($state.is('adminOPs.viewUserDetail') && toUpdate === 'admin'){
						$scope.opStatus = false;
						$scope.adminRight = true;
						$scope.adminOpModalTitle = "Update "+_this.userDataToUpdate.name+"\'s Admin Rights";
					}

					$scope.submitted = false;
					$scope.updateStatusAndRights = function($event){
						$event.preventDefault();
						$scope.submitted = true;
						if($scope.manageUserAccountForm.$valid){
							_this.userDataToUpdate.action = [];
							_this.userDataToUpdate.upDateUserRightOpComments = $scope.upDateUserRightOpComments;
							if(!$scope.opStatus){
								delete _this.userDataToUpdate.opStatus;
								delete _this.userDataToUpdate.upDateUserRightOpComments.opStateUpdateComments;
							}
							else{
								_this.userDataToUpdate.action.push("@opState");
							}
							if(!$scope.adminRight){
								delete _this.userDataToUpdate.adminRight;
								delete _this.userDataToUpdate.upDateUserRightOpComments.adminRightUpdateComments;
							}
							else{
								_this.userDataToUpdate.action.push("@admin");
							}
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
					close(null,200);
				});
			});
		};

		$scope.executeUpdate = function(user){
			restDataService.postData("users/manageAccountLock",user,function(response){
				if(response.data.status == "Success"){
					if($state.is("adminOPs.viewUser")){
						$scope.fecthAndUpDateTableData($scope.manageAcctSearchParams);
					}
					else if($state.is("adminOPs.viewUserDetail")){
						$state.reload($state.current.name);
					}
				}
				else{
					alert("Something went wrong pls try again");
				}
			});
		};

		$scope.fecthAndUpDateTableData = function(acctListingParams){
			viewUserLastSearchParams.setLastFilterParam(acctListingParams);
			restDataService.getData("users/getUserAccountsList" , acctListingParams , function(response){
				$scope.updateTable(response.data);
			});	
		};
		
		$scope.updateTable = function(data){
			$scope.accountsList  = [];
			[].push.apply($scope.accountsList , data.results);
			$scope.sameAsWorkingUserID = data.workingUserId;
			$scope.lastPageNo = data.noOfPages;
			$scope.recordsSize = data.recordsSize;
			$scope.dataReadSuccess = true;
		};

		if(lastViewedUserActList && lastViewedUserActList.data && lastViewedUserActList.data.results && lastViewedUserActList.data.results.length > 0){
			$scope.updateTable(lastViewedUserActList.data);
			angular.copy(viewUserLastSearchParams.getLastSearchParam() , $scope.manageAcctSearchParams);
		}

		$scope.exportUserAccounts = function($event){
			$event.preventDefault();
			var exportAs = $event.target.innerText;
			var data = $scope.accountsList;
			var downloadUrl = "";
			var fileName = "";

			var userAccountTableClone = (document.getElementById('userAccountListTable')).cloneNode(true);
			userAccountTableClone.setAttribute("border" , 1);
			userAccountTableClone.setAttribute("cellspacing" , 0);
			userAccountTableClone.setAttribute("style","font-size:8px;");
			var childElements = userAccountTableClone.children;
			var childElementsCount = userAccountTableClone.childElementCount;
			userAccountTableClone.removeChild(childElements[childElementsCount-1]);
			userAccountTableClone.firstElementChild.children[0].removeChild(userAccountTableClone.firstElementChild.children[0].lastElementChild);
			var dataRows = userAccountTableClone.lastElementChild.children;
			var dataRowsCount = userAccountTableClone.lastElementChild.childElementCount;
			for(var i=0;i<dataRowsCount;i++){
				dataRows[i].removeChild(dataRows[i].lastElementChild);
			}

			if(exportAs === "PDF"){				
				restDataService.post(
					'users/html2pdf',
					{html2pdfData:JSON.stringify(userAccountTableClone.outerHTML)},
					{headers: {
						'Content-Type': "application/json",
						'Accept': "application/pdf"
					},
					responseType: 'arraybuffer'}
				).then(function(res){
					var blob=new Blob([res.data] , { type: 'application/pdf'});
					downloadUrl=URL.createObjectURL(blob);
					fileName="users_account_list_"+$scope.sameAsWorkingUserID+"_"+Date.now()+".pdf";
					$scope.downLoadFile(downloadUrl,fileName);
				});
			}
			else if(exportAs === "CSV"){
				var cscvString = "";
				csvString = "SL.No,Name,Email,Username,Operational State,Admin"+ "\n";
				for(var i=0; i<data.length;i++){
					csvString = csvString+(i+1)+",";
					csvString = csvString + data[i].name+",";
					csvString = csvString + data[i].email+",";
					csvString = csvString + data[i].username+",";
					csvString = csvString + data[i].opState+",";
					csvString = csvString + (data[i].admin ? "Yes" : "No")+",\n";
				}
				downloadUrl = 'data:application/octet-stream;base64,'+btoa(csvString);
				fileName = "users_account_list_"+$scope.sameAsWorkingUserID+"_"+Date.now()+".csv";
				$scope.downLoadFile(downloadUrl,fileName);
			}			
		};

		$scope.downLoadFile = function(url,fileName){
			if(url !== "" && fileName !== ""){
				var a = $('<a/>', {
					style:'display:none',
					href:url,
					download:fileName
				}).appendTo('body');
				a[0].click();
				a.remove();
			}
		}
	}]);
});