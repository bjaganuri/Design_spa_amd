define (['../module'] , function(app){
	app.constant("MIN" , 15);	//Min is specified in minutes
	app.constant("T" , 60);		//T specified in seconds

	//Service defined to observe idle state od user
	app.provider("idleObserverService" , function () {
		var timeout = 15;
		var count = 15;
		var warning = false;
		var timedout = false;
		var idletimer = "";
		this.setTimeout = function (MIN) {
			timeout = MIN;
			count = MIN;
		};
		
		this.$get = ['$rootScope','Idle','$http','restDataService','$state','$interval' , function ($rootScope,Idle,$http,restDataService,$state,$interval) {
			$rootScope.timeout = timeout;
			$rootScope.count = count;
			return{
				checkUserLoggedStatus: function () {
					restDataService.get("/users/sessionData" , '').then(function(response){
						if(response.data.status === "AUTHORIZED" && !$state.includes("authenticateUser") && !$state.includes("otherwise")){
							$("#warningModal").modal("show");
							warning = true;
							idletimer = $interval(function(){
								$rootScope.count--;
							} , 1000*60);
						}
						else{
							Idle.unwatch();
						}
					});
				},
				start:function() {
					this.stop();
					Idle.watch();
				},
				idleTimeout:function () {
					$("#timeOutModal").modal("show");
					timedout = true;	
				},
				stop:function() {
					if (warning) {
						$("#warningModal").modal("hide");
						warning = false;
					}
					if (timedout) {
						$("#timeOutModal").modal("hide");
						timedout = false;
					}
					$interval.cancel(idletimer);
					$rootScope.count = $rootScope.timeout;
				},
				logout:function($event){
					this.stop();
					$http.get("/users/logout");
					$state.transitionTo('authenticateUser.login');
				}
			};
		}];
	});
});