define(['../module'], function (app) {
	app.controller('designLayoutController' , ['$scope','fileUpload','restDataService', function($scope,fileUpload,restDataService){
		$scope.psdTotemplate = true;
		$scope.fileName = 'Choose a file...';
		$scope.overwrite = false;
		
		$scope.uploadFile = function(){
			var file = $scope.myFile;
			var uploadUrl = "users/uploadPSDFile/psd";
			var fd = new FormData();
			fd.append('file', file);
			fd.append('comments', "No comment");	
			fd.append('fileName', file.name);
			fd.append('type', file.type);
			restDataService.getData('users/fileExists' ,{fileName:file.name,type:file.type} ,function (response) {
				if(response.data.status){
					if (confirm("File Already exists do you want to overwrite") == true){
						$scope.overwrite = true;
					}
					else{
						$scope.overwrite = false;
					}
				}
				else{
					$scope.overwrite = false;
				}				
				fd.append('overwrite', $scope.overwrite);
				fileUpload.uploadFileToUrl(fd, uploadUrl,function(res){
					console.log(res.data);
				});
			});
		};
	}]);
});