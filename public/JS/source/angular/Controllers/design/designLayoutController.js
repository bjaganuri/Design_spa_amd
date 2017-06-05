define(['../module'], function (app) {
	app.controller('designLayoutController' , ['$scope','fileUpload','restDataService', function($scope,fileUpload,restDataService){
		$scope.psdTotemplate = true;
		$scope.fileName = 'Choose a file...';
		
		$scope.uploadFile = function(){
			var file = $scope.myFile;
			var uploadUrl = "users/parsePSD";
			restDataService.getData('users/fileExists' ,{fileName:file.name,type:file.type} ,function (response) {
				if(response.data.status){
					if (confirm("File Already exists do you want to overwrite") == true)
						fileUpload.uploadFileToUrl(file, uploadUrl,true);
					else
						fileUpload.uploadFileToUrl(file, uploadUrl,false);
					return;
				}
				fileUpload.uploadFileToUrl(file, uploadUrl,false);
			});
		};
	}]);
});