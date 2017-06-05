define(['../module'], function (app) {
	app.controller("mainController" , ['$scope','idleObserverService', function($scope,idleObserverService){    
		$scope.logout = function () {
			idleObserverService.logout();
		};
	}]);
});