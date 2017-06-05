define(['../module'] , function(app){
	app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl,overwrite){
        var fd = new FormData();
        fd.append('psdFile', file);
        fd.append('comments', "No comment");
        fd.append('overwrite', overwrite);
        fd.append('fileName', file.name);
        fd.append('type', file.type);
        $http({
            url:uploadUrl,
            method:"POST",
            data:fd,
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        })
        .then(function(response){
            console.log(response);
        },function(error){
            console.log(error);
        });
    };
}]);
});