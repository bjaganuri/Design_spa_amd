define (['../app'] , function(app){
	app.run(['$rootScope','idleObserverService' , 'Idle','$templateCache','ModalService','$state', function($rootScope,idleObserverService,Idle,$templateCache,ModalService,$state) {
		$rootScope.$on('IdleStart', function() {
			idleObserverService.checkUserLoggedStatus();
		});

		$rootScope.$on('IdleEnd', function() {
			idleObserverService.stop();
		});

		$rootScope.$on('IdleTimeout', function() {
			idleObserverService.stop();
			idleObserverService.idleTimeout();
		});

		$rootScope.$on("$stateChangeStart" , function (event, toState, toParams, fromState, fromParams) {
			var templateUrls = [];
			if(fromState.hasOwnProperty('templateUrl')  && typeof fromState.templateUrl === "string"){
				templateUrls.push(fromState.templateUrl);
			}
			else if(fromState.hasOwnProperty('templateUrl')  && typeof fromState.templateUrl === "function"){
				templateUrls.push(fromState.templateUrl(fromParams));
			}
			else if(fromState.hasOwnProperty('views')){
				for(key in fromState.views){
					if(fromState.views[key].hasOwnProperty('templateUrl') && typeof fromState.views[key].templateUrl === "string"){
						templateUrls.push(fromState.views[key].templateUrl);
					}
					else if(fromState.views[key].hasOwnProperty('templateUrl') && typeof fromState.views[key].templateUrl === "function"){
						templateUrls.push(fromState.views[key].templateUrl(fromParams));
					}
				}
			}
			for(var i=0;i<templateUrls.length;i++){
				$templateCache.remove(templateUrls[i]);
			}
			//$templateCache.removeAll();
		});

		$rootScope.$on("$stateChangeSuccess" , function (event, toState, toParams, fromState, fromParams) {
			idleObserverService.start();
		});

		$rootScope.$on("loggedOut" , function(event,args){
			var modalInstance = ModalService.showModal({
				templateUrl: 'reLoginModal.html',
				controller:function($scope, $element){
					$rootScope.reLoginTriggered = true;			
				},
				preClose: function(modal){
					return modal.element.modal('hide');
				}
			}).then(function(modal) {
				modal.element.modal();
			});
		});

		$rootScope.$on("accountLocked" , function(event,args){
			var modalInstance = ModalService.showModal({
				templateUrl: 'accountLocked.html',
				controller:function($scope, $element, close){
					$scope.navigateToLoginPage = function(){
						$element.modal('hide');
						close(null, 200);
					};
				},
				preClose: function(modal){
					return modal.element.modal('hide');
				}
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					
				});
			});
		});

		Idle.watch();
	}]);
});