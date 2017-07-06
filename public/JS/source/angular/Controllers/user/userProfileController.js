define(['../module'], function (app) {
	app.controller("userProfileController" , ['$scope','restDataService',function($scope,restDataService) {
		$scope.updateUser = {};
		$scope.submitted = false;
		$scope.updateSuccess = false;
		$scope.updateError = "Unknown Error Please try again";
		$scope.showUpdateError = false;
		
		$scope.$on('$stateChangeSuccess', function() {
			$scope.getProfileData();
		});
		
		$scope.getProfileData = function () {
			restDataService.getData("users/getUserProfile",'',function (response) {
				response.data.hasOwnProperty("__v") ? delete response.data['__v'] : null;
				response.data.altMobile = parseInt(response.data.altMobile,10);
				response.data.mobile = parseInt(response.data.mobile,10);
				//response.data.dob = (new Date(response.data.dob)).toLocaleDateString();
				$scope.updateUser = response.data;
			});
		};
		
		$scope.updateProfile = function ($event) {
			$scope.submitted = true;
			if($scope.updateProfileForm.$valid){
				$scope.updateUser.dob = (new Date($scope.updateUser.dob)).toDateString();
				restDataService.postData("users/updateUserProfile",$scope.updateUser,function(response){
					if(response.data.status == "Success"){
						$event.target.reset();
						$scope.updateUser = {};
						$scope.updateProfileForm.$setPristine();
						$scope.updateProfileForm.$setUntouched();
						$scope.submitted = false;
						$scope.updateSuccess = true;
						$scope.showUpdateError = false;
					}
					else{
						$scope.updateError = response.data ? response.data : $scope.updateError;
						$scope.showUpdateError = true;
					}
				});
			}
		};
		
		$scope.updateProfileAgain = function () {
			$scope.updateSuccess = false;
			$scope.getProfileData();
		};
	}]);

	app.controller("learnController" , ['$scope','getIndexData','$anchorScroll','$location','$state' , function ($scope,getIndexData,$anchorScroll,$location,$state) {
		$scope.indexTreeViewObject = getIndexData.data;	
		$scope.$watch( 'indexTree.currentNode', function( newObj, oldObj ) {
			if( $scope.indexTree && angular.isObject($scope.indexTree.currentNode) ) {
				var newHash = $scope.indexTree.currentNode.id;
				if ($location.hash() !== newHash) {
					$location.hash($scope.indexTree.currentNode.id);
				}
				else{
					$anchorScroll($scope.indexTree.currentNode.id);
				}
			}
		}, true);
	}]);
});