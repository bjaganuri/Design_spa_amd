define (['../app'] , function(app){
	app.run(['$rootScope','idleObserverService' , 'Idle','$templateCache','ModalService', function($rootScope,idleObserverService,Idle,$templateCache,ModalService) {
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
			$templateCache.remove(fromState.templateUrl);
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
					return modal.element.modal('hide');;
				}
			}).then(function(modal) {
				modal.element.modal();
			});
		});

		Idle.watch();
	}]);
});